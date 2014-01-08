package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

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
          case Some(Tile.Air)                            => walk(destPos)
          case Some(Tile.Beer)                           => drink(destPos)
          case Some(Tile.Mine(owner)) if owner == number => walk(destPos)
          case _                                         => walk(destPos)
        }
      }
    }

    def walk(pos: Pos) = Success {
      game.step(_.withHero(_ moveTo pos))
    }

    def drink(pos: Pos) = walk(pos) map {
      _.withBoard(_ remove pos).withHero(_.drinkBeer)
    }

    def fight(enemy: Hero) = walk(enemy.pos) map { g =>
      val (h2, e2) = hero fight enemy
      g.withHero(if (h2.isDead) reSpawn(h2) else h2)
        .withHero(if (e2.isDead) reSpawn(e2) else e2)
    }

    @annotation.tailrec
    def reSpawn(h: Hero): Hero = {
      val pos = Pos(Random nextInt (board.size / 2 - 2), Random nextInt (board.size / 2 - 2))
      if (Validator.heroPos(game, pos)) h reSpawn pos
      else reSpawn(h)
    }

    if (game.hero != hero) n00b(s"Not hero $number turn to move")
    else reach(hero.pos to dir)
  }

  private def n00b(err: String) = Failure(new Exception(s"n00b! $err"))
}
