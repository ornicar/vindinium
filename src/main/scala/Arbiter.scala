package org.jousse
package bot

import scala.util.{ Try, Success, Failure }

object Arbiter {

  def move(game: Game, number: Int, dir: Dir): Try[Game] = {

    val hero = game hero number
    val board = game.board

    def reach(destPos: Pos) = board get destPos match {
      case None            => n00b("Moving out the board")
      case Some(Tile.Wall) => n00b("Hitting the wall")
      case tile => game hero destPos match {
        case Some(enemy) => fight(enemy)
        case None => tile match {
          case Some(Tile.Air)                            => justWalk(destPos)
          case Some(Tile.Potion)                         => drink(destPos)
          case Some(Tile.Mine(owner)) if owner == number => justWalk(destPos)
          case _                                         => justWalk(destPos)
        }
      }
    }

    def justWalk(destPos: Pos) = Success {
      game.step(_.withHero(_ moveTo destPos))
    }

    def drink(destPos: Pos) = Success {
      game.step(_.withHero(_.drinkPotion moveTo destPos))
    }

    def fight(enemy: Hero) = ???

    if (game.hero != hero) n00b(s"Not hero $number turn to move")
    else reach(hero.pos to dir)
  }

  private def n00b(err: String) = Failure(new Exception(s"n00b! $err"))
}
