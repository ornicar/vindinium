package org.vindinium.server
package system

import user.User

import akka.actor._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

final class Elo extends Actor with ActorLogging {

  val gameBonus = 1

  import Elo._

  context.system.eventStream.subscribe(self, classOf[Game])

  def receive = {

    case game: Game if game.finished && game.arena && game.hasManyNames => playersOf(game) foreach { players =>
      players.groupBy(_.user) foreach {
        case (user, userPlayers) => {
          val diff = userPlayers.foldLeft(0) {
            case (d, p) => d + players.map(calculateEloDiff(p)).foldLeft(0)(_ + _)
          }
          User.setElo(user.id, user.elo + diff + gameBonus)
        }
      }
    }

    case Init =>
  }

  def playersOf(game: Game): Future[List[Player]] = User findByNames game.names map { users =>
    game.heroes.map { hero =>
      users.find(_.name == hero.name) map { Player(_, hero) }
    }.flatten
  }

  private def calculateEloDiff(player: Player)(opponent: Player): Int =
    if (player is opponent) 0
    else {
      val expected = 1 / (1 + math.pow(10, (opponent.elo - player.elo) / 400f))
      val kFactor = math.round(
        if (player.nbGames > 20) 16
        else 50 - player.nbGames * (34 / 20f)
      )
      val diff = 2 * kFactor * (player.score(opponent) - expected)
      // println(s"$player vs $opponent = ${diff.toInt}")
      diff.toInt
    }
}

object Elo {

  case class Player(user: User, hero: Hero) {
    def name = user.name
    def gold = hero.gold
    def elo = user.elo
    def nbGames = user.nbGames
    def is(opponent: Player) = name == opponent.name
    def score(opponent: Player): Float =
      if (gold > opponent.gold) 1f
      else if (gold < opponent.gold) 0f
      else 0.5f

    override def toString = s"$name [${hero.id}] [gold:$gold] [elo:$elo]"
  }

  case object Init

  import play.api.Play.current
  import play.api.libs.concurrent.Akka
  val actor = Akka.system.actorOf(Props[Elo], name = "elo")
}
