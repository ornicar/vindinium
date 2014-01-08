package org.jousse
package bot

import akka.actor._
import akka.pattern.{ ask, pipe }
import play.api.libs.concurrent.Akka
import play.api.Play.current
import scala.concurrent.Future
import scala.util.{ Try, Success, Failure }

final class Manager extends Actor {

  import Manager._

  private val games = scala.collection.mutable.Map[String, Game]()

  def receive = {

    case Get(id) => sender ! games.get(id)

    case Create(config) => Generator(config) match {
      case Failure(e) => sender ! Status.Failure(e)
      case Success(game) => {
        games += (game.id -> game)
        sender ! game
      }
    }

    case GetOrCreate => games.headOption map (_._2) match {
      case Some(game) => sender ! game
      case None       => self.tell(Create(Config.random), sender)
    }
  }
}

object Manager {

  def get(id: String): Future[Option[Game]] = actor ? Get(id) mapTo manifest[Option[Game]]
  def create(config: Config): Future[Game] = actor ? Create(config) mapTo manifest[Game]
  def getOrCreate: Future[Game] = actor ? GetOrCreate mapTo manifest[Game]

  import akka.util.Timeout
  import scala.concurrent.duration._
  private implicit val timeout = Timeout(1.second)

  val actor = Akka.system.actorOf(Props[Manager])

  case class Get(id: String)
  case class Create(config: Config)
  case object GetOrCreate
}
