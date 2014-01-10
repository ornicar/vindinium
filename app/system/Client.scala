package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ Future, Promise, promise }
import scala.util.{ Try, Success, Failure }

final class Client(pov: Pov, driver: Driver) extends Actor with LoggingFSM[Client.State, Client.Data] {

  import Client._

  startWith(Waiting, newResponse)

  when(Waiting) {

    case Event(game: Game, Response(promise)) => {
      promise success game
      if (game.finished) goto(Closed) using Nothing
      else {
        driver match {
          case Driver.Http       =>
          case Driver.Auto(play) => sender ! Server.Play(pov, play(game))
        }
        goto(Working) using Nothing
      }
    }
  }

  when(Working) {

    case Event(WorkDone(promise), Nothing) => goto(Waiting) using Response(promise)
  }
}

object Client {

  case class WorkDone(promise: Promise[Game])

  sealed trait State
  case object Waiting extends State
  case object Working extends State
  case object Closed extends State

  sealed trait Data
  case object Nothing extends Data
  case class Response(promise: Promise[Game]) extends Data

  def newResponse = Response(promise[Game])
}
