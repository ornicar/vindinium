package controllers

import org.vindinium.server._

import play.api._
import play.api.mvc._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global

object App extends Controller {

  def index = Action.async {
    val topUserNb = 50
    val recentReplayNb = 50
    system.Replay recent recentReplayNb zip user.User.top(topUserNb) map {
      case (replays, users) => Ok(views.html.index(replays, users))
    }
  }

  def documentation = Action {
    Ok(views.html.documentation())
  }

  def starters = Action {
    Ok(views.html.starters())
  }
}
