package controllers

import org.jousse.bot._

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import play.api._
import play.api.libs.EventSource
import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.mvc._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import system.Storage
import system.Visualization
import system.Visualization._

object Application extends Controller {

  def index = Action.async {
    system.Pool create Config.random map { game ⇒
      val replay = system.Replay(game.id, List(JsonFormat(game)))
      Ok(views.html.visualize(replay))
    }
  }

  def visualization(id: String) = Action.async {
    Storage.get(id) map {
      case Some(replay) ⇒ Ok(views.html.visualize(replay))
      case None         ⇒ NotFound
    }
  }

  def gameEvents(id: String) = Action.async {

    implicit val timeout = Timeout(1.second)
    val actor = Visualization.actor

    Storage.get(id) flatMap {
      case None => Future.successful(NotFound)

      case Some(replay) =>
        actor ? GetStream(id) mapTo manifest[Option[Enumerator[Game]]] map {
          case None => NotFound

          case Some(stream) ⇒
            if (replay.finished) {
              NotFound
            } else {
              val played = Enumerator.enumerate(replay.games)
              Ok.chunked(played >>> (stream &> asJson) &> EventSource()).as("text/event-stream")
            }

        }
      }
  }

  def test = Action {
    Ok(views.html.test())
  }

}
