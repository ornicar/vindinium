package controllers

import org.jousse.bot._
import org.jousse.bot.system._

import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import play.api._
import play.api.libs.json.Json
import play.api.mvc._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import user.{ User => U }

object Api extends Controller {

  implicit val timeout = Timeout(60.second)

  def training = Action.async { implicit req =>
    form.training.bindFromRequest.fold(
      err => Future successful BadRequest,
      data => U findByKey data.key flatMap {
        case None => Future failed UserNotFoundException("Key not found")
        case Some(user) => (Server.actor ? Server.RequestToPlayAlone(user, data.config)) map {
          case input: PlayerInput => {
            println(input.game.render)
            Ok(JsonFormat(input, req.host)) as JSON
          }
        } recover {
          case e: GameException => {
            play.api.Logger("API").warn(e.toString)
            BadRequest
          }
        }
      }
    )
  }

  def arena = Action.async { req =>
    (Server.actor ? Server.RequestToPlayArena) map {
      case input: PlayerInput => {
        println(input.game.render)
        Ok(JsonFormat(input, req.host)) as JSON
      }
    }
  }

  def move(gameId: String, token: String) = Action.async { implicit req =>
    form.move.bindFromRequest.fold(
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
