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

object Api extends Controller {

  implicit val timeout = Timeout(10.second)

  def trainingAlone = Action.async { req =>
    (Server.actor ? Server.RequestToPlayAlone) map {
      case input: PlayerInput => Ok(JsonFormat(input, req.domain)) as JSON
    }
  }

  def move(gameId: String, token: String, dir: String) = Action.async { req =>
    Server.actor ? Server.Play(Pov(gameId, token), dir) map {
      case input: PlayerInput => Ok(JsonFormat(input, req.domain)) as JSON
    } recover {
      case e: NotFoundException => NotFound(e.getMessage)
    }
  }
}
