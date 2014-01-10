package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import play.api.libs.concurrent.Akka
import play.api.Play.current
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{ Try, Success, Failure }

final class Server extends Actor {

  import Server._

  private implicit val timeout = Timeout(1.second)

  val clients = scala.collection.mutable.Map[String, ActorRef]()

  def receive = {

    case _ =>

  }
}

object Server {
}
