package org.jousse.bot
package system

import akka.actor._
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{ Try, Success, Failure }
import user.User

final class Pool extends Actor with ActorLogging {

  import Pool._

  val actors = scala.collection.mutable.Map[String, ActorRef]()

  override val supervisorStrategy =
    OneForOneStrategy() {
      case _: RuleViolationException ⇒ Resume
      case _: Exception              ⇒ Escalate
    }

  def receive = {

    case Play(pov, dir) => actors get pov.gameId match {
      case None     => log.warning(s"No game for $pov")
      case Some(ga) => ga forward GameActor.Play(pov.token, dir)
    }

    case Get(id) => actors get id match {
      case None     => sender ! Status.Failure(new Exception(s"No game for id $id"))
      case Some(ga) => ga forward GameActor.Get
    }

    case Set(id, game) => actors get id foreach { _ ! GameActor.Set(game) }

    case Create(config) => (config.map match {
      case m: Config.GenMap      => Generator(m, config.turns, config.training)
      case Config.StringMap(str) => StringMapParser(str) map (_ game config.turns)
    }) match {
      case Failure(e) => sender ! Status.Failure(e)
      case Success(game) => {
        val actor = context.actorOf(Props(new GameActor(game)), name = s"game-${game.id}")
        actors += (game.id -> actor)
        context watch actor
        sender ! game
      }
    }

    case GetOrCreate => {
      implicit val timeout = Timeout(1.second)
      actors.headOption map (_._2) match {
        case Some(ga) => ga ? GameActor.Get pipeTo sender
        case None     => self.tell(Create(Config.random), sender)
      }
    }

    case Terminated(actor) ⇒ {
      context unwatch actor
      actors filter (_._2 == actor) foreach {
        case (id, _) ⇒ actors -= id
      }
    }
  }
}

object Pool {

  private implicit val timeout = Timeout(1.second)

  def get(id: String): Future[Option[Game]] = actor ? Get(id) mapTo manifest[Option[Game]]
  def create(config: Config): Future[Game] = actor ? Create(config) mapTo manifest[Game]
  def getOrCreate: Future[Game] = actor ? GetOrCreate mapTo manifest[Game]

  import play.api.libs.concurrent.Akka
  import play.api.Play.current
  val actor = Akka.system.actorOf(Props[Pool], name = "pool")

  case class Get(id: String)
  case class Create(config: Config)
  case object GetOrCreate
  case class Set(id: String, game: Game)
  case class Play(pov: Pov, dir: Dir)
}
