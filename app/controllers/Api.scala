package controllers

import org.jousse.bot._
import org.jousse.bot.system._

import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import play.api._
import play.api.data._
import play.api.data.Forms._
import play.api.libs.json.Json
import play.api.mvc._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object Api extends Controller {

  implicit val timeout = Timeout(60.second)

  def trainingAlone = Action.async { req =>
    (Server.actor ? Server.RequestToPlayAlone) map {
      case input: PlayerInput => {
        println(input.game.render)
        Ok(JsonFormat(input, req.host)) as JSON
      }
    }
  }

  def arena = Action.async { req =>
    (Server.actor ? Server.RequestToPlayArena) map {
      case input: PlayerInput => {
        println(input.game.render)
        Ok(JsonFormat(input, req.host)) as JSON
      }
    }
  }

  val moveForm = Form(single("dir" -> nonEmptyText))

  def move(gameId: String, token: String) = Action.async { implicit req =>
    moveForm.bindFromRequest.fold(
      err => Future successful BadRequest,
      dir => Server.actor ? Server.Play(Pov(gameId, token), dir) map {
        case input: PlayerInput => {
          Ok(JsonFormat(input, req.host)) as JSON
        }
      } recover {
        case e: NotFoundException => NotFound(e.getMessage)
      }
    )
  }
}
