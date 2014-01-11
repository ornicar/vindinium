package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import play.api.libs.concurrent.Akka
import play.api.Play.current
import scala.concurrent.Future
import scala.util.{ Try, Success, Failure }

final class GameActor(initialGame: Game) extends Actor with ActorLogging {

  import GameActor._

  private var game = initialGame

  def receive = {

    case Get => sender ! game

    case Play(token, dir) => {
      game = Arbiter.move(game, token, dir)
      sender ! game
    }
  }
}

object GameActor {

  case object Get
  case class Play(token: String, dir: Dir)
}
