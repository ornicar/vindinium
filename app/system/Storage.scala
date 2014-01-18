package org.jousse.bot
package system

import akka.actor._

final class Storage extends Actor with ActorLogging {

  import Storage._

  context.system.eventStream.subscribe(self, classOf[Game])

  def receive = {

    case game: Game => Replay add game

    case Init       =>
  }
}

object Storage {

  case class Save(game: Game)
  case object Init

  import play.api.Play.current
  import play.api.libs.concurrent.Akka
  val actor = Akka.system.actorOf(Props[Storage], name = "storage")
}
