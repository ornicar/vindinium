package controllers

import org.jousse.bot._

import play.api._
import play.api.mvc._
import scala.concurrent.ExecutionContext.Implicits.global
import system.Storage

object Application extends Controller {

  def index = Action.async {
    system.Pool create Config.random map { game =>
      val replay = system.Replay(game.id, List(JsonFormat(game)))
      Ok(views.html.visualize(replay))
    }
  }

  def visualization(id: String) = Action.async {
    Storage.get(id) map {
      case Some(replay) => Ok(views.html.visualize(replay))
      case None => NotFound
    }
  }

  def test = Action {
    Ok(views.html.test())
  }

}
