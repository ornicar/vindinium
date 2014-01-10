package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout

import play.api.libs.iteratee._

final class Visualization extends Actor {

  context.system.eventStream.subscribe(self, classOf[Game])

  def receive = {

    case game: Game => {
      println(game)
    }
  }
}

object Visualization {

  import play.api.libs.concurrent.Akka
  import play.api.Play.current

  val (enumerator, channel) = Concurrent.broadcast[String]
  val actor = Akka.system.actorOf(Props[Visualization], name = "visualization")


}
