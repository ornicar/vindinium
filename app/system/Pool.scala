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

final class Pool extends ActorMap[GameActor] {

  import Pool._

  implicit val timeout = Timeout(1.second)

  val gameActors = scala.collection.mutable.Map[String, ActorRef]()

  def mkActor

  def receive = {

    case Play(id: String, token: String, dir: Dir) => gameActors get id match {
      case None     => sender ! Status.Failure(new Exception(s"No such game: $id"))
      case Some(ga) => ga forward GameActor.Move(token, dir)
    }

    case Get(id) => gameActors get id match {
      case None     => sender ! Status.Failure(new Exception(s"No such game: $id"))
      case Some(ga) => ga forward GameActor.Get
    }

    case Create(config) => Generator(config) match {
      case Failure(e) => sender ! Status.Failure(e)
      case Success(game) => {
        gameActors += (game.id -> context.actorOf(Props(new GameActor(game))))
        sender ! game
      }
    }

    case GetOrCreate => gameActors.headOption map (_._2) match {
      case Some(ga) => ga ? GameActor.Get pipeTo sender
      case None     => self.tell(Create(Config.random), sender)
    }
  }
}

object Pool {

  private implicit val timeout = Timeout(1.second)

  def get(id: String): Future[Option[Game]] = actor ? Get(id) mapTo manifest[Option[Game]]
  def create(config: Config): Future[Game] = actor ? Create(config) mapTo manifest[Game]
  def getOrCreate: Future[Game] = actor ? GetOrCreate mapTo manifest[Game]

  val actor = Akka.system.actorOf(Props[Pool])

  case class Get(id: String)
  case class Create(config: Config)
  case object GetOrCreate
  case class Play(id: String, token: String, dir: Dir)
}
