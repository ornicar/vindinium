package controllers

import org.jousse.bot._

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
  private def eventSource(data: Enumerator[String]) = Ok.chunked(data &> EventSource()).as("text/event-stream")

  def events(id: String) = Action.async {
    implicit val timeout = Timeout(1.second)
    Replay find id flatMap {
      case None => Future successful notFoundPage
      case Some(replay) => {
        val soFar: Enumerator[String] = Enumerator.enumerate(replay.games) &> asJsonString
        Visualization.actor ? GetStream(id) mapTo manifest[Option[Enumerator[Game]]] map {
          case None => eventSource(soFar)
          case Some(stream) ⇒ eventSource {
            if (replay.finished) soFar else soFar >>> (stream &> asJsonString)
          }
        }
      }
    }
  }
}
