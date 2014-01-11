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

  def receive = {

    case Connect(id) ⇒ {
      channels(id) = Concurrent.broadcast[Game]
    }

    case game: Game ⇒ {
      channels.get(game.id) map {
        case (enum, chan) ⇒ chan.push(game)
      }
    }
  }
}

object Visualization {

  case class Connect(id: String)

  import play.api.libs.concurrent.Akka
  import play.api.Play.current

  val actor = Akka.system.actorOf(Props[Visualization], name = "visualization")

  val channels: Map[String, (Enumerator[Game], Channel[Game])] = Map()

  val asJson: Enumeratee[Game, JsValue] = Enumeratee.map[Game](game ⇒ JsonFormat(game))
}
