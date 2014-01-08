package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Arbiter {

  def move(game: Game, number: Int, dir: Dir): Try[Game] = {

    val hero = game hero number
    val board = game.board

    def reach(destPos: Pos) = board get destPos match {
      case None            => fail("Moving out the board")
      case Some(Tile.Wall) => fail("Hitting the wall")
      case tile => game hero destPos match {
        case Some(enemy) => fight(enemy)
        case None => tile match {
          case Some(Tile.Beer)                         => drink(destPos)
          case Some(Tile.Mine(n)) if n != Some(number) => mine(destPos)
          case _                                       => walk(destPos)
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
      val (h1, h2) = hero fight enemy
      List(h1 -> h2, h2 -> h1).foldLeft(g) {
        case (game, (x, y)) => if (x.isDead) game
          .withHero(reSpawn(x))
          .withBoard(_.transferMines(x.number, if (y.isAlive) Some(y.number) else None))
        else game withHero hero
      }
    }

    def mine(pos: Pos) = walk(pos) map { g =>
      val h1 = hero.fightMine
      if (h1.isAlive) g.withHero(h1).withBoard(_.transferMine(pos, Some(h1.number)))
      else g.withHero(reSpawn(h1)).withBoard(_.transferMines(h1.number, None))
    }

    @annotation.tailrec
    def reSpawn(h: Hero): Hero = {
      val pos = Pos(Random nextInt (board.size / 2 - 2), Random nextInt (board.size / 2 - 2))
      if (Validator.heroPos(game, pos)) h reSpawn pos
      else reSpawn(h)
    }

    if (game.hero != hero) fail(s"Not hero $number turn to move")
    else reach(hero.pos to dir)
  }
}
