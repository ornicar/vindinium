package controllers

import org.vindinium.server._

import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import play.api._
import play.api.libs.Comet.CometMessage
import play.api.libs.EventSource
import play.api.libs.iteratee._
import play.api.libs.json._
import play.api.mvc._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import system.{ Server, Replay }
import user.{ User => U }

object Game extends Controller {

  def show(id: String) = Action.async {
    Replay find id map {
      case Some(replay) => Ok(views.html.visualize(replay))
      case None         => notFoundPage
    }
  }

  private implicit val timeout = Timeout(1.second)
  private implicit val encoder = CometMessage[String](identity)

  private val asJsonString: Enumeratee[Game, String] =
    Enumeratee.map[Game](game => Json stringify JsonFormat(game))

  private def eventSource(data: Enumerator[Game]) =
    Ok.chunked(data &> asJsonString &> EventSource()).as("text/event-stream")

  def events(id: String) = Action.async {
    Server.actor ? Server.GetEnumerator(id) mapTo manifest[Option[Enumerator[Game]]] flatMap {
      case Some(enumerator) => Future successful eventSource(enumerator)
      case None => Replay find id map {
        case None         => notFoundPage
        case Some(replay) => eventSource(replay.games)
      }
    }
  }
}
