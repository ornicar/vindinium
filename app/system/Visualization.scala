package org.jousse.bot
package system

import scala.collection.mutable.Map

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout

import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.libs.iteratee.Concurrent.Channel
import scala.concurrent.ExecutionContext.Implicits.global

final class Visualization extends Actor {

  import Visualization._

  context.system.eventStream.subscribe(self, classOf[Game])

  val channels: Map[String, (Enumerator[Game], Channel[Game])] = Map()

  def receive = {

    case Init ⇒

    case GetStream(id) ⇒ {
      sender ! channels.get(id).map(_._1)
    }

    case game: Game ⇒ {
      channels.get(game.id) match {
        case Some((enum, chan)) ⇒ chan.push(game)

        case None               ⇒ channels += (game.id -> Concurrent.broadcast[Game])
      }
    }

  }
}

object Visualization {

  case object Init
  case class Connect(id: String)
  case class GetStream(id: String)

  import play.api.libs.concurrent.Akka
  import play.api.Play.current

  val actor = Akka.system.actorOf(Props[Visualization], name = "visualization")
  val asJson: Enumeratee[Game, JsValue] = Enumeratee.map[Game](game ⇒ JsonFormat(game))
}
