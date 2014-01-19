package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ Future, Await, Promise, promise }
import scala.util.{ Try, Success, Failure }
import user.User

final class Server extends Actor with ActorLogging {

  import Server._

  val clients = scala.collection.mutable.Map[Pov, ActorRef]()
  val games = scala.collection.mutable.Map[String, Game]()

  var nextArenaGameId: Option[String] = None

  def receive = akka.event.LoggingReceive {

    case RequestToPlayAlone(user, config) => {
      val replyTo = sender
      addGame(config) match {
        case Failure(e) => replyTo ! Status.Failure(e)
        case Success(game) => {
          join(Right(user), game.id, Driver.Http, inputPromise(replyTo))
          game.heroes drop 1 foreach { hero =>
            join(Left("random"), game.id, Driver.Random, inputPromise(replyTo))
          }
        }
      }
    }

    case RequestToPlayArena(user) => {
      val replyTo = sender
      (nextArenaGameId flatMap games.get match {
        case None => addGame(Config.arena) map { game =>
          nextArenaGameId = Some(game.id)
          log.info(s"[game ${game.id}] create")
          game
        }
        case Some(game) => Success(game)
      }) match {
        case Failure(e)    => log.error(e.getMessage)
        case Success(game) => join(Right(user), game.id, Driver.Http, inputPromise(replyTo))
      }
    }

    case Play(pov, dir) => {
      val replyTo = sender
      (clients.get(pov) -> games.get(pov.gameId)) match {
        case (_, None) => replyTo ! notFound(s"No game for id ${pov.gameId}")
        // found game, but no client. Probably it timed out.
        case (None, Some(g)) => replyTo ! PlayerInput(g, pov.token)
        case (Some(client), Some(g)) => {
          val game = Arbiter.move(g, pov.token, Dir(dir))
          client ! Client.WorkDone(inputPromise(replyTo))
          step(game)
        }
      }
    }

    case Client.AiTimeout(pov) =>
      games get pov.gameId filterNot (_.finished) foreach { g =>
        g.hero filter (_.token == pov.token) foreach { hero =>
          log.info(s"Received $pov timeout")
          val game = g.crash(hero.token, Crash.Timeout)
          step(game)
        }
      }

    case Terminated(client) ⇒ {
      context unwatch client
      clients filter (_._2 == client) foreach { case (id, _) ⇒ clients -= id }
    }
  }

  def step(game: Game) {
    update(game)
    context.system.eventStream publish game
    if (game.finished) gameClients(game.id) foreach (_ ! game)
    else game.hero foreach { h =>
      clients get Pov(game.id, h.token) foreach (_ ! game)
    }
  }

  def addGame(config: Config): Try[Game] = (config.map match {
    case m: Config.GenMap      => Generator(m, config.turns, config.training)
    case Config.StringMap(str) => StringMapParser(str) map (_ game config.turns)
  }) map { game =>
    update(game)
    game
  }

  def update(game: Game) {
    games += (game.id -> game)
  }

  def join(
    user: Either[String, User],
    gameId: String,
    driver: Driver,
    promise: Promise[PlayerInput]) {
    games get gameId match {
      case None => log.error(s"Can't join non existing game $gameId")
      case Some(g) => {
        val id = gameClients(g.id).size + 1
        val game = g.withHero(id, h => user.fold(h.withName, _ blame h))
        val token = game.hero(id).token
        val pov = Pov(game.id, token)
        log.info(s"[game ${game.id}] add client $user ($token)")
        try {
          val client = context.actorOf(
            Props(new Client(pov, driver, promise)),
            name = s"client-${game.id}-$token")
          clients += (pov -> client)
          context watch client
          update(game)
          if (id == 4) start(game)
        }
        catch {
          case InvalidActorNameException(e) => log.warning(e)
        }
      }
    }
  }

  def start(game: Game) {
    if (game.arena) nextArenaGameId = None
    log.info(s"[game ${game.id}] start")
    game.hero map { h => Pov(game.id, h.token) } flatMap clients.get match {
      case None => throw UtterFailException(s"Game ${game.id} started without a hero client")
      case Some(client) => {
        context.system.eventStream publish game
        client ! game
      }
    }
  }

  def inputPromise(to: ActorRef) = {
    val p = promise[PlayerInput]
    p.future onSuccess {
      case x => to ! x
    }
    p
  }

  def gameClients(gameId: String) = clients collect {
    case (Pov(id, _), client) if id == gameId => client
  }
}

object Server {

  case class RequestToPlayAlone(user: User, config: Config)
  case class RequestToPlayArena(user: User)

  case class Play(pov: Pov, dir: String)

  import play.api.libs.concurrent.Akka
  import play.api.Play.current
  val actor = Akka.system.actorOf(Props[Server], name = "server")
}
