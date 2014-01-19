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

  def index = Action.async {
    val topUserNb = 50
    val recentReplayNb = 50
    Replay recent recentReplayNb zip U.top(topUserNb) map {
      case (replays, users) => Ok(views.html.index(replays, users))
    }
  }

  def show(id: String) = Action.async {
    Replay find id map {
      case Some(replay) ⇒ Ok(views.html.visualize(replay))
      case None         ⇒ NotFound
    }
  }

  def documentation() = Action {
    Ok(views.html.documentation())
  }

  def events(id: String) = Action.async {

    implicit val timeout = Timeout(1.second)
    val actor = Visualization.actor

    Replay find id flatMap {
      case None => Future.successful(NotFound)

      case Some(replay) =>
        actor ? GetStream(id) mapTo manifest[Option[Enumerator[Game]]] map {
          case None => Ok.chunked(Enumerator.enumerate(replay.games)).as("text/event-stream")

          case Some(stream) ⇒
            if (replay.finished) {
              NotFound
            }
            else {
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
