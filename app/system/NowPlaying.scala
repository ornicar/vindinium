package org.vindinium.server
package system

import user.User

import akka.actor._
import play.api.libs.iteratee._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

final class NowPlaying extends Actor {

  context.system.eventStream.subscribe(self, classOf[Game])

  var games = List[Game]()

  def hasGame(id: String) = games.exists(_.id == id)

  def gameIds = games.map(_.id)

  val (enumerator, channel) = Concurrent.broadcast[List[String]]

  def receive = {

    case game: Game if game.arena && game.started && !hasGame(game.id) =>
      games = game :: games
      channel push gameIds

    case game: Game if game.arena && game.finished && hasGame(game.id) =>
      games = games filterNot (_.id == game.id)
      channel push gameIds

    case NowPlaying.GetEnumerator =>
      sender ! { Enumerator.enumerate(List(gameIds)) >>> enumerator }

    case NowPlaying.GetEnumeratorFor(userId) => sender ! {
      Enumerator.enumerate(List(games.filter(_ hasUserId userId).map(_.id))) >>> {
        enumerator &> Enumeratee.map[List[String]] { ids =>
          ids filter { id => games.exists(g => g.id == id && (g hasUserId userId)) }
        }
      }
    }

    case NowPlaying.Init =>
  }
}

object NowPlaying {

  case object Init
  case object GetEnumerator
  case class GetEnumeratorFor(userId: String)

  import play.api.Play.current
  import play.api.libs.concurrent.Akka
  val actor = Akka.system.actorOf(Props[NowPlaying], name = "now-playing")
}
