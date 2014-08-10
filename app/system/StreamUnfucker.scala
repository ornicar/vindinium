package org.vindinium.server
package system

import play.api.libs.iteratee._, Enumeratee._
import scala.concurrent.{ Future, ExecutionContext }

// Re-ordonate events based on game turn
object StreamUnfucker {

  private type From = Game
  private type To = Game

  def apply()(implicit ec: ExecutionContext): Enumeratee[From, To] = {
    var turn = 1
    val prematureGames = scala.collection.mutable.Map[Int, Game]()
    Enumeratee.mapConcat[Game] {
      case g if g.turn == turn =>
        turn = turn + 1
        def complete(games: List[Game]): List[Game] =
          prematureGames.get(turn).fold(games) { game =>
            // println(s"Re-inserting premature game turn ${game.turn}")
            prematureGames -= turn
            turn = turn + 1
            complete(games :+ game)
          }
        complete(List(g))
      case g if g.turn > turn =>
        // println(s"Received premature game turn ${g.turn} but current turn is $turn")
        prematureGames += (g.turn -> g)
        Nil
      case g =>
        // println(s"Received ancient game turn ${g.turn} but current turn is $turn")
        Nil
    }
  }
}
