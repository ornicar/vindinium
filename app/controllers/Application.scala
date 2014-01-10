package controllers

import org.jousse.bot._

import play.api._
import play.api.mvc._
import scala.concurrent.ExecutionContext.Implicits.global

object Application extends Controller {

  def index = Action.async {
    system.Pool create Config.random map { game =>
      Ok(views.html.index(game))
    }
  }

}
