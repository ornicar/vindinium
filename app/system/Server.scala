package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ Future, Await, Promise, promise }
import scala.util.{ Try, Success, Failure }
import user.User

final class Server extends Actor with ActorLogging {

  import Server._

  implicit val timeout = Timeout(1.second)

  val clients = scala.collection.mutable.Map[Pov, ActorRef]()

  var nextArenaGame: Option[Game] = None

  def receive = akka.event.LoggingReceive {

    case RequestToPlayAlone(user, config) => {
      val replyTo = sender
      Pool create config onComplete {
        case Failure(e) => replyTo ! Status.Failure(e)
        case Success(g) => {
          val game = g.withHero(1, _ withName user.name)
          context.system.eventStream publish game
          self ! AddClient(Pov(game.id, game.hero1.token), Driver.Http, inputPromise(replyTo))
          game.heroes drop 1 foreach { hero =>
            self ! AddClient(Pov(game.id, hero.token), Driver.Random, inputPromise(replyTo))
          }
          self ! Start(game)
        }
      }
    }

    case RequestToPlayArena(user) => {
      val replyTo = sender
      val game = nextArenaGame match {
        case None => {
          val g = Await.result(Pool create Config.random, 1.second)
          val game = g.withHero(1, _ withName user.name)
          context.system.eventStream publish g
          nextArenaGame = Some(g)
          self ! AddClient(Pov(g.id, g.hero1.token), Driver.Http, inputPromise(replyTo))
          // self ! AddClient(Pov(g.id, g.hero2.token), Driver.Random, inputPromise(replyTo))
          // self ! AddClient(Pov(g.id, g.hero3.token), Driver.Random, inputPromise(replyTo))
        }
        case Some(g) => {
          val id = gameClients(g.id).size + 1
          val game = g.withHero(id, _ withName user.name)
          self ! AddClient(Pov(g.id, g.hero(id).token), Driver.Http, inputPromise(replyTo))
          if (id == 4) {
            self ! Start(g)
            nextArenaGame = None
          }
        }
      }
    }

    case AddClient(pov, driver, promise) => {
      println(pov)
      val client = context.actorOf(
        Props(new Client(pov, driver, promise)),
        name = s"client-${pov.gameId}-${pov.token}")
      clients += (pov -> client)
      context watch client
    }

    case Start(game) => {
      context.system.eventStream publish game
      game.hero map { h => Pov(game.id, h.token) } flatMap clients.get match {
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
            context.system.eventStream publish game
            client ! Client.WorkDone(inputPromise(replyTo))
            game.hero filterNot (_ => game.finished) match {
              case None    => gameClients(game.id) foreach (_ ! game)
              case Some(h) => clients get Pov(game.id, h.token) foreach (_ ! game)
            }
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

  def gameClients(gameId: String) = clients collect {
    case (Pov(id, _), client) if id == gameId => client
  }
}

object Server {

  case class RequestToPlayAlone(user: User, config: Config)
  case class RequestToPlayArena(user: User)

  case class Play(pov: Pov, dir: String)

  private case class AddClient(pov: Pov, driver: Driver, promise: Promise[PlayerInput])
  private case class Start(game: Game)

  import play.api.libs.concurrent.Akka
  import play.api.Play.current
  val actor = Akka.system.actorOf(Props[Server], name = "server")
}
