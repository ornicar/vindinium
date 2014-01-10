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

  def trainingAlone = Action.async {
    (Server.actor ? Server.RequestToPlayAlone).thenPp map {
      case Server.Welcome(game, token) => Ok(Json.obj(
        "game" -> JsonFormat(game),
        "token" -> token,
        "playUrl" -> routes.Api.move(game.id, token, "dir").url
      )) as JSON
    }
  }

  def move(gameId: String, token: String, dir: String) = Action.async {
    Server.actor ? Server.Play(Pov(gameId, token), dir) map {
      case game: Game => Ok(Json.obj(
        "game" -> JsonFormat(game),
        "debug" -> game.toString
      )) as JSON
    }
  }
}
