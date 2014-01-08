package org.jousse
package bot

import scala.util.{ Try, Success, Failure }

object Arbiter {

  def move(game: Game, number: Int, dir: Dir): Try[Game] = {

    val board = game.board
    val fromPos = board findHero number

    def n00b(err: String) = Failure(new Exception(s"n00b! $err"))

    def reach(destPos: Pos) = board get destPos match {
      case None                                      => n00b("Moving out the board")
      case Some(Tile.Wall)                           => n00b("Hitting the wall")
      case Some(Tile.Air)                            => justWalk(destPos)
      case Some(Tile.Mine(owner)) if owner == number => justWalk(destPos)
      case _                                         => justWalk(destPos)
    }

    def justWalk(destPos: Pos) = Success {
      game.step(_.updated(

      ))
    }

    if (game.player.number != number) n00b(s"Not player $number turn to move")
    else fromPos match {
      case None      => n00b(s"The hero number $number is not on the map")
      case Some(pos) => reach(pos to dir)
    }
  }
}
