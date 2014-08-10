package org.vindinium.server
package system

import akka.actor._
import play.api.libs.iteratee._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ Promise, Await }
import scala.util.{ Try, Success, Failure }
import user.User

final class Round(val initGame: Game) extends Actor with CustomLogging {

  val clients = collection.mutable.Map[Token, ActorRef]()
  val moves = collection.mutable.ArrayBuffer[Dir]()
  var gameAtStart = initGame
  var game = initGame

  val (enumerator, channel) = Concurrent.broadcast[Game]

  import Round._

  context setReceiveTimeout 1.minute

  def receive = {

    case SendEnumerator(to) => to ! Some {
      (enumerator interleave {
        (Enumerator enumerate moves) &> Enumeratee.scanLeft(gameAtStart)(Arbiter.replay)
      }) &> StreamUnfucker()
    }

    case msg@Play(token, _) => clients get token match {
      case None =>
        log.warning(s"No client for ${game.id}/$token")
        sender ! notFound("Wrong or expired token")
      case Some(client) => client ! ClientPlay(msg, sender)
    }

    case ClientPlay(Play(token, d), replyTo) => {
      val client = sender
      val dir = Dir(d)
      Arbiter.move(game, token, dir) match {
        case Failure(e) =>
          log.info(s"Play fail ${game.id}/$token: ${e.getMessage}")
          replyTo ! Status.Failure(e)
        case Success(g) =>
          client ! Client.WorkDone(inputPromise(replyTo))
          saveMove(dir)
          step(g)
      }
    }

    case Join(user, promise) => {
      val heroId = clients.size + 1
      game = game.withHero(heroId, user.blame)
      // FIXME
      val token = game.hero(heroId).token
      log.info(s"[game ${game.id}] add user ${user.name} #$heroId ($token)")
      addClient(token, Props(new HttpClient(token, promise)))
    }

    case JoinBot(name, driver) => {
      val heroId = clients.size + 1
      game = game.withHero(heroId, _ withName name)
      // FIXME
      val token = game.hero(heroId).token
      log.info(s"[game ${game.id}] add bot $name ($token)")
      addClient(token, Props(new BotClient(token, driver)))
    }

    case Client.Timeout(token) => {
      log.info(s"${game.id}/$token timeout")
      val dir = Dir.Crash
      Arbiter.move(game, token, dir) match {
        case Failure(e) => log.warning(s"Crash fail ${game.id}/$token: ${e.getMessage}")
        case Success(g) =>
          saveMove(dir)
          step(g)
      }
    }

    case Terminated(client) => {
      context unwatch client
      clients filter (_._2 == client) foreach { case (id, _) => clients -= id }
    }

    case ReceiveTimeout => context.parent ! Inactive(game.id)
  }

  def addClient(token: Token, props: Props) {
    val client = context.actorOf(props, name = token)
    clients += (token -> client)
    context watch client
    if (clients.size == 4) {
      log.info(s"[game ${game.id}] start")
      gameAtStart = game
      game.hero map (_.token) flatMap clients.get match {
        case None => throw UtterFailException(s"Game ${game.id} started without a hero client")
        case Some(client) =>
          Replay insert game
          client ! game
      }
    }
  }

  def stayCrashed(token: String) = Arbiter.move(game, token, Dir.Stay) match {
    case Failure(e) => log.info(s"Crashed stay fail ${game.id}/$token: ${e.getMessage}")
    case Success(g) =>
      saveMove(Dir.Stay)
      step(g)
  }

  def saveMove(dir: Dir) {
    moves += dir
    Replay.addMove(game.id, dir)
  }

  def step(g: Game) {
    game = g
    channel push game
    context.system.eventStream publish game
    if (game.finished) {
      Replay.finish(game.id, moves)
      clients.values foreach (_ ! game)
      channel.eofAndEnd
    }
    else game.hero foreach {
      case h if h.crashed => stayCrashed(h.token)
      case h              => clients get h.token foreach (_ ! game)
    }
  }
}

object Round {

  case class Play(token: Token, dir: String)
  case class ClientPlay(play: Play, replyTo: ActorRef)

  case class Join(user: User, promise: Promise[PlayerInput])
  case class JoinBot(name: String, driver: Driver)

  case class Inactive(id: GameId)

  case class SendEnumerator(to: ActorRef)
}
