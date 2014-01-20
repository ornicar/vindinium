package org.jousse.bot
package system

import user.User

import akka.actor._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

final class Elo extends Actor with ActorLogging {

  import Elo._

  context.system.eventStream.subscribe(self, classOf[Game])

  def receive = {

    case game: Game if game.finished && game.arena && game.hasManyNames => playersOf(game) foreach { players =>
      players foreach { player =>
        players filterNot (_.name == player.name) map { opponent =>
        }
      }
    }

    case Init =>
  }

  def playersOf(game: Game): Future[List[Player]] = User findByNames game.names map { users =>
    users.map { user =>
      game heroByName user.name map { Player(user, _) }
    }.flatten
  }
}

object Elo {

  sealed trait Score
  case object Win extends Score
  case object Loss extends Score
  case object Draw extends Score

  case class Player(user: User, hero: Hero) {
    def name = user.name
    def gold = hero.gold
    def score(opponent: Player) =
      if (gold > opponent.gold) Win
      else if (gold < opponent.gold) Loss
      else Draw
  }

  case object Init

  import play.api.Play.current
  import play.api.libs.concurrent.Akka
  val actor = Akka.system.actorOf(Props[Elo], name = "elo")
}
