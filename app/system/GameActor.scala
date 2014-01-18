package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import play.api.libs.concurrent.Akka
import play.api.Play.current
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{ Try, Success, Failure }

final class GameActor(initialGame: Game) extends Actor with ActorLogging {

  import GameActor._

  private var game = initialGame

  context setReceiveTimeout 10.minutes

  def receive = {

    case ReceiveTimeout ⇒ self ! PoisonPill

    case Get    => sender ! game

    case Set(g) => game = g

    case Play(token, dir) => {
      game = Arbiter.move(game, token, dir)
      sender ! game
    }
  }
}

object GameActor {

  case object Get
  case class Set(g: Game)
  case class Play(token: String, dir: Dir)
}
