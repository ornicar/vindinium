package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import play.api.libs.concurrent.Akka
import play.api.Play.current
import scala.concurrent.Future
import scala.util.{ Try, Success, Failure }

final class GameActor(initialGame: Game) extends Actor {

  import GameActor._

  private var game = initialGame

  def receive = {

    case Get => sender ! game

    case Move(token, dir) => Arbiter.move(game, token, dir) match {
      case Success(g) => {
        game = g
        sender ! game
      }
      case Failure(e) => sender ! (Status Failure e)
    }
  }
}

object GameActor {

  case object Get
  case class Move(token: String, dir: Dir)
}
