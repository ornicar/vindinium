package org.jousse
package bot

import scala.util.{ Try, Success, Failure }

object Arbiter {

  def move(game: Game, number: Int, dir: Dir): Try[Game] = {

    val hero = game hero number
    val board = game.board

    def reach(destPos: Pos) = board get destPos match {
      case None                                      => n00b("Moving out the board")
      case Some(Tile.Wall)                           => n00b("Hitting the wall")
      case Some(Tile.Air)                            => justWalk(destPos)
      case Some(Tile.Mine(owner)) if owner == number => justWalk(destPos)
      case _                                         => justWalk(destPos)
    }

    def justWalk(destPos: Pos) = Success {
      game
    }

    if (game.hero != hero) n00b(s"Not hero $number turn to move")
    else reach(hero.pos to dir)
  }

  private def n00b(err: String) = Failure(new Exception(s"n00b! $err"))
}
