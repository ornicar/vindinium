package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ Future, Promise, promise }
import scala.util.{ Try, Success, Failure }

final class Client(
    pov: Pov,
    driver: Driver,
    initialPromise: Promise[PlayerInput]) extends Actor with LoggingFSM[Client.State, Client.Data] {

  import Client._

  startWith(Waiting, Response(initialPromise))

  driver match {

    case Driver.Http => when(Waiting) {

      case Event(game: Game, Response(promise)) => {
        promise success PlayerInput(game, pov.token)
        if (game.finished) goto(Closed) using Nothing
        else goto(Working) using Nothing
      }
    }
    case Driver.Auto(play) => when(Waiting) {

      case Event(game: Game, _) => {
        context.system.scheduler.scheduleOnce(botDelay, sender, Server.Play(pov, play(game)))
        goto(Working) using Nothing
      }
    }
  }

  when(Working) {

    case Event(WorkDone(promise), Nothing) => goto(Waiting) using Response(promise)
  }
}

object Client {

  private val botDelay = 200.millis

  case class WorkDone(promise: Promise[PlayerInput])

  sealed trait State
  case object Waiting extends State
  case object Working extends State
  case object Closed extends State

  sealed trait Data
  case object Nothing extends Data
  case class Response(promise: Promise[PlayerInput]) extends Data
}
