package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ Future, promise }
import scala.util.{ Try, Success, Failure }

final class Server extends Actor with ActorLogging {

  import Server._

  implicit val timeout = Timeout(1.second)

  val clients = scala.collection.mutable.Map[Pov, ActorRef]()

  def receive = {

    case RequestToPlayAlone => Pool create Config.random map { game =>
      self ! AddClient(Pov(game.id, game.hero1.token), Driver.Http)
      game.heroes drop 1 foreach { hero =>
        self ! AddClient(Pov(game.id, hero.token), Driver.Immobile)
      }
      Welcome(game, game.hero1.token)
    } pipeTo sender

    case AddClient(pov, driver) => {
      val client = context.actorOf(Props(new Client(pov, driver)), name = s"client-${pov.gameId}-${pov.token}")
      clients += (pov -> client)
      context watch client
    }

    case Play(pov, dir) => clients get pov match {
      case None => log.warning(s"No client for $pov")
      case Some(client) => {
        Pool.actor ? Pool.Play(pov, Dir(dir)) mapTo manifest[Game] foreach { game =>
          val answerPromise = promise[Game]
          answerPromise.future onSuccess { case game => sender ! game }
          client ! Client.WorkDone(answerPromise)
          clients get Pov(game.id, game.hero.token) foreach (_ ! game)
        }
      }
    }

    case Terminated(client) ⇒ {
      context unwatch client
      clients filter (_._2 == client) foreach {
        case (id, _) ⇒ clients -= id
      }
    }
  }

  def opponents(pov: Pov) = clients collect {
    case (Pov(id, token), client) if id == pov.gameId && token != pov.token => client
  }
}

object Server {

  case object RequestToPlayAlone
  case class Welcome(game: Game, token: String)

  case class Play(pov: Pov, dir: String)

  private case class AddClient(pov: Pov, driver: Driver)

  import play.api.libs.concurrent.Akka
  import play.api.Play.current
  val actor = Akka.system.actorOf(Props[Server], name = "server")
}
