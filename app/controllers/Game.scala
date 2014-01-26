package controllers

import org.vindinium.server._

import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import play.api._
import play.api.libs.EventSource
import play.api.libs.iteratee._
import play.api.libs.json._
import play.api.mvc._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import system.Visualization._
import system.{ Replay, Visualization }
import user.{ User => U }

object Game extends Controller {

  def show(id: String) = Action.async {
    Replay find id map {
      case Some(replay) ⇒ Ok(views.html.visualize(replay))
      case None         ⇒ notFoundPage
    }
  }

  private implicit val stringMessages = play.api.libs.Comet.CometMessage[String](identity)
  private def soFar(replay: Replay): Enumerator[String] = replay.games &> asJsonString
  private def eventSource(data: Enumerator[String]) = Ok.chunked(data &> EventSource()).as("text/event-stream")

  def events(id: String) = Action.async {
    implicit val timeout = Timeout(1.second)
    Replay find id flatMap {
      case None                            => Future successful notFoundPage
      case Some(replay) if replay.finished => Future successful eventSource(soFar(replay))
      case Some(replay) => Visualization.actor ? GetStream(id) mapTo
        manifest[Option[Enumerator[Game]]] map { stream =>
          eventSource {
            stream.fold(soFar(replay)) { s =>
              soFar(replay) >>> (s &> asJsonString)
            }
          }
        }
    }
  }
}
