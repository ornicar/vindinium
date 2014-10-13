package org.vindinium.server
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import org.joda.time.DateTime
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
      if (game.finished) goto(GameFinished)
      else goto(Working) using Since(DateTime.now)
    }

    case Event(Round.ClientPlay(_, replyTo), _) => {
      replyTo ! Status.Failure(TimeoutException("Wait, you're not supposed to play now"))
      stay
    }
  }

  when(Working, stateTimeout = aiTimeout) {

    case Event(msg: Round.ClientPlay, Since(since)) => {
      val time = DateTime.now.getMillisOfDay - since.getMillisOfDay
      if (time >= playerMinTimeOfPlay) sender ! msg
      else context.system.scheduler.scheduleOnce((playerMinTimeOfPlay - time).millis, sender, msg)
      stay
    }

    case Event(WorkDone(promise), _) => goto(Waiting) using Response(promise)

    case Event(StateTimeout, _) => {
      context.parent ! Timeout(token)
      goto(TimedOut)
    }

    case Event(x, y) =>
      println(x, y)
      stay
  }

  when(TimedOut) {

    case Event(game: Game, _) if game.finished && !(game.training && game.hero1.timedOut) => goto(GameFinished)

    case Event(game: Game, _) => stay

    case Event(Round.ClientPlay(_, replyTo), _) => {
      replyTo ! Status.Failure(TimeoutException("Time out! You must play faster"))
      stay
    }
  }

  when(GameFinished) {

    case Event(Round.ClientPlay(_, replyTo), _) => {
      replyTo ! Status.Failure(TimeoutException("The game is finished"))
      stay
    }

  }
}

final class BotClient(token: Token, driver: Driver) extends Client {

  import Client._

  startWith(Waiting, Since(DateTime.now))

  when(Waiting) {

    case Event(game: Game, _) if game.finished => stop()

    case Event(game: Game, _) => {
      context.system.scheduler.scheduleOnce(botDelay, sender, Round.Play(token, driver play game))
      goto(Working)
    }
  }

  when(Working) {

    case Event(msg: Round.ClientPlay, _) => {
      context.system.scheduler.scheduleOnce(botMinTimeOfPlay.millis, sender, msg)
      stay
    }

    case Event(WorkDone(promise), _) => goto(Waiting)
  }
}

object Client {

  val playerMinTimeOfPlay = 60
  val botMinTimeOfPlay = 50

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
  case object GameFinished extends State

  sealed trait Data
  case class Since(date: DateTime) extends Data
  case class Response(promise: Promise[PlayerInput]) extends Data
}
