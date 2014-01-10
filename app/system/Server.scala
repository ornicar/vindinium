package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ Future, Promise, promise }
import scala.util.{ Try, Success, Failure }

final class Server extends Actor with ActorLogging {

  import Server._

  implicit val timeout = Timeout(1.second)

  val clients = scala.collection.mutable.Map[Pov, ActorRef]()

  def receive = akka.event.LoggingReceive {

    case RequestToPlayAlone => {
      val replyTo = sender
      Pool create Config.random foreach { game =>
        self ! AddClient(Pov(game.id, game.hero1.token), Driver.Http, inputPromise(replyTo))
        game.heroes drop 1 foreach { hero =>
          self ! AddClient(Pov(game.id, hero.token), Driver.Immobile, inputPromise(replyTo))
        }
        self ! Start(game)
      }
    }

    case AddClient(pov, driver, promise) => {
      val client = context.actorOf(
        Props(new Client(pov, driver, promise)),
        name = s"client-${pov.gameId}-${pov.token}")
      clients += (pov -> client)
      context watch client
    }

    case Start(game: Game) => {
      val pov = Pov(game.id, game.hero.token)
      clients get pov match {
        case None         => throw UtterFailException(s"Game ${game.id} started without a hero client")
        case Some(client) => client ! game
      }
    }

    case Play(pov, dir) => {
      val replyTo = sender
      clients get pov match {
        case None => replyTo ! notFound(s"No client for $pov")
        case Some(client) => {
          Pool.actor ? Pool.Play(pov, Dir(dir)) mapTo manifest[Game] foreach { game =>
            client ! Client.WorkDone(inputPromise(replyTo))
            clients get Pov(game.id, game.hero.token) foreach (_ ! game)
          }
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

  def inputPromise(to: ActorRef) = {
    val p = promise[PlayerInput]
    p.future onSuccess {
      case x => to ! x
    }
    p
  }

  def opponents(pov: Pov) = clients collect {
    case (Pov(id, token), client) if id == pov.gameId && token != pov.token => client
  }
}

object Server {

  case object RequestToPlayAlone

  case class Play(pov: Pov, dir: String)

  private case class AddClient(pov: Pov, driver: Driver, promise: Promise[PlayerInput])
  private case class Start(game: Game)

  import play.api.libs.concurrent.Akka
  import play.api.Play.current
  val actor = Akka.system.actorOf(Props[Server], name = "server")
}
