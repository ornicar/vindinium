package org.jousse.bot
package system

import akka.actor._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Promise
import scala.util.{ Try, Success, Failure }
import user.User

final class Round(val initGame: Game) extends Actor with CustomLogging {

  val clients = scala.collection.mutable.Map[Token, ActorRef]()
  var game = initGame

  import Round._

  context setReceiveTimeout 10.seconds

  def receive = {

    case Play(token, dir) => {
      val replyTo = sender
      clients get token match {
        case None => replyTo ! notFound(s"No client for ${game.id}/$token")
        case Some(client) => Arbiter.move(game, token, Dir(dir)) match {
          case Failure(e) => {
            log.info(s"Play fail ${game.id}/$token: ${e.getMessage}")
            replyTo ! Status.Failure(e)
          }
          case Success(g) => {
            client ! Client.WorkDone(inputPromise(replyTo))
            step(g)
          }
        }
      }
    }

    case Join(user, driver, promise) => {
      val heroId = clients.size + 1
      game = game.withHero(heroId, h => user.fold(h.withName, _ blame h))
      // FIXME
      val token = game.hero(heroId).token
      log.info(s"[game ${game.id}] add client $user ($token)")
      val client = context.actorOf(Props(new Client(token, driver, promise)), name = token)
      clients += (token -> client)
      context watch client
      if (clients.size == 4) {
        log.info(s"[game ${game.id}] start")
        game.hero map (_.token) flatMap clients.get match {
          case None => throw UtterFailException(s"Game ${game.id} started without a hero client")
          case Some(client) => {
            context.system.eventStream publish game
            client ! game
          }
        }
      }
    }

    case Client.Timeout(token) => {
      log.info(s"${game.id}/$token timeout")
      Arbiter.crash(game, token) match {
        case Failure(e) => log.warning(s"Crash fail ${game.id}/$token: ${e.getMessage}")
        case Success(g) => step(g)
      }
    }

    case Terminated(client) ⇒ {
      context unwatch client
      clients filter (_._2 == client) foreach { case (id, _) ⇒ clients -= id }
    }

    case ReceiveTimeout ⇒ self ! PoisonPill
  }

  def step(g: Game) {
    // log.info(s"step game $game")
    game = g
    context.system.eventStream publish game
    if (game.finished) clients.values foreach (_ ! game)
    else game.hero foreach {
      case h if h.crashed => step(game.step)
      case h              => clients get h.token foreach (_ ! game)
    }
  }
}

object Round {

  case class Play(token: String, dir: String)

  case class Join(
    user: Either[String, User],
    driver: Driver,
    promise: Promise[PlayerInput])
}
