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

  var nextArenaGame: Option[Game] = None

  def receive = akka.event.LoggingReceive {

    case RequestToPlayAlone(user, config) => {
      val replyTo = sender
      Pool create config onComplete {
        case Failure(e) => replyTo ! Status.Failure(e)
        case Success(g) => {
          val game = g.withHero(1, _ withName user.name)
          context.system.eventStream publish game
          addClient(user.name, game, Driver.Http, inputPromise(replyTo))
          game.heroes drop 1 foreach { hero =>
            addClient("random", game, Driver.Random, inputPromise(replyTo))
          }
        }
      }
    }

    case RequestToPlayArena(user) => {
      val replyTo = sender
      val game = nextArenaGame match {
        case None => {
          val g = Await.result(Pool create Config.arena, 1.second)
          context.system.eventStream publish g
          nextArenaGame = Some(g)
          log.info(s"[game ${g.id}] create")
          g
        }
        case Some(g) => g
      }
      addClient(user.name, game, Driver.Http, inputPromise(replyTo))
    }

    case Play(pov, dir) => {
      val replyTo = sender
      clients get pov match {
        case None => replyTo ! notFound(s"No client for $pov")
        case Some(client) => {
          implicit val timeout = Timeout(1.second)
          Pool.actor ? Pool.Play(pov, Dir(dir)) mapTo manifest[Game] foreach { game =>
            context.system.eventStream publish game
            client ! Client.WorkDone(inputPromise(replyTo))
            game.hero filterNot (_ => game.finished) match {
              case None    => gameClients(game.id) foreach (_ ! game)
              case Some(h) => clients get Pov(game.id, h.token) foreach (_ ! game)
            }
          }
        }
      }
    }

    case Terminated(client) ⇒ {
      context unwatch client
      clients filter (_._2 == client) foreach {
        case (id, _) ⇒ clients -= id
      }
    }
  }

  def addClient(
    name: String,
    game: Game,
    driver: Driver,
    promise: Promise[PlayerInput]) {
    val id = gameClients(game.id).size + 1
    val token = game.hero(id).token
    val pov = Pov(game.id, token)
    log.info(s"[game ${game.id}] add client $name ($token)")
    try {
      val client = context.actorOf(
        Props(new Client(pov, driver, promise)),
        name = s"client-${game.id}-$token")
      clients += (pov -> client)
      context watch client
      val game2 = game.withHero(id, _ withName name)
      Pool.actor ! Pool.Set(game.id, game2)
      if (id == 4) start(game2)
    }
    catch {
      case InvalidActorNameException(e) => log.warning(e)
    }
  }

  def start(game: Game) {
    if (game.arena) nextArenaGame = None
    log.info(s"[game ${game.id}] start")
    context.system.eventStream publish game
    game.hero map { h => Pov(game.id, h.token) } flatMap clients.get match {
      case None         => throw UtterFailException(s"Game ${game.id} started without a hero client")
      case Some(client) => client ! game
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
