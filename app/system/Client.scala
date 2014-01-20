package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ Future, Promise, promise }
import scala.util.{ Try, Success, Failure }

sealed trait Client extends Actor with LoggingFSM[Client.State, Client.Data]

final class HttpClient(token: Token, initialPromise: Promise[PlayerInput]) extends Client {

  import Client._

  startWith(Waiting, Response(initialPromise))

  when(Waiting) {

    case Event(game: Game, Response(promise)) => {
      promise success PlayerInput(game, token)
      if (game.finished) stop()
      else goto(Working) using Nothing
    }

    case Event(Round.ClientPlay(_, replyTo), _) => {
      replyTo ! Status.Failure(TimeoutException("Wait, you're not supposed to play now"))
      stay
    }
  }

  when(Working, stateTimeout = aiTimeout) {

    case Event(msg: Round.ClientPlay, _) => {
      sender ! msg
      stay
    }

    case Event(WorkDone(promise), Nothing) => goto(Waiting) using Response(promise)

    case Event(StateTimeout, _) => {
      context.parent ! Timeout(token)
      goto(TimedOut)
    }
  }

  when(TimedOut) {

    case Event(game: Game, _) if game.finished => stop()

    case Event(game: Game, _)                  => stay

    case Event(Round.ClientPlay(_, replyTo), _) => {
      replyTo ! Status.Failure(TimeoutException("Time out! You must play faster"))
      stay
    }
  }
}

final class BotClient(token: Token, driver: Driver) extends Client {

  import Client._

  startWith(Waiting, Nothing)

  when(Waiting) {

    case Event(game: Game, _) if game.finished => stop()

    case Event(game: Game, _) => {
      context.system.scheduler.scheduleOnce(botDelay, sender, Round.Play(token, driver play game))
      goto(Working)
    }
  }

  when(Working) {

    case Event(msg: Round.ClientPlay, _) => {
      sender ! msg
      stay
    }

    case Event(WorkDone(promise), Nothing) => goto(Waiting)
  }
}

object Client {

  import play.api.Play.current
  val botDelay = play.api.Play.configuration
    .getMilliseconds("vindinium.auto-client-delay")
    .getOrElse(0l)
    .milliseconds
  val aiTimeout = play.api.Play.configuration
    .getMilliseconds("vindinium.ai-timeout")
    .getOrElse(0l)
    .milliseconds

  case class WorkDone(promise: Promise[PlayerInput])
  case class Timeout(token: Token)

  sealed trait State
  case object Waiting extends State
  case object Working extends State
  case object TimedOut extends State

  sealed trait Data
  case object Nothing extends Data
  case class Response(promise: Promise[PlayerInput]) extends Data
}
