package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Arbiter {

  def move(game: Game, number: Int, dir: Dir): Try[Game] = {

    val board = game.board

    def reach(destPos: Pos) = board get destPos match {
      case None => stay
      case Some(tile) => game hero destPos match {
        case Some(_) => stay
        case None => tile match {
          case Tile.Air                          => walk(destPos)
          case Tile.Tavern                       => drink
          case Tile.Mine(n) if n != Some(number) => mine(destPos)
          case Tile.Mine(n)                      => stay
          case Tile.Wall                         => stay
        }
      }
    }

    def stay = Success {
      game.step(identity)
    }

    def walk(pos: Pos) = Success {
      game.step(_.withHero(_ moveTo pos))
    }

    def drink = stay map {
      _.withHero(_.drinkBeer)
    }

    def mine(pos: Pos) = stay map { g =>
      val h1 = g.hero(number).fightMine
      if (h1.isAlive) g.withHero(h1).withBoard(_.transferMine(pos, Some(h1.number)))
      else g.withHero(reSpawn(h1)).withBoard(_.transferMines(h1.number, None))
    }

    @annotation.tailrec
    def reSpawn(h: Hero): Hero = {
      val pos = Pos(Random nextInt (board.size / 2 - 2), Random nextInt (board.size / 2 - 2))
      if (Validator.heroPos(game, pos)) h reSpawn pos
      else reSpawn(h)
    }

    def fights(g: Game): Game =
      (g.hero(number).pos.neighbors map g.hero).flatten.foldLeft(g)(attack)

    def attack(g: Game, enemy: Hero): Game = {
      val (h1, h2) = g hero number attack enemy
      List(h1 -> h2, h2 -> h1).foldLeft(g) {
        case (game, (x, y)) => if (x.isDead) game
          .withHero(reSpawn(x))
          .withBoard(_.transferMines(x.number, if (y.isAlive) Some(y.number) else None))
        else game withHero x
      }
    }

    def finalize(g: Game) = g.withHero(number, _.day withGold g.board.countMines(number))

    if (game.hero.number != number) fail(s"Not hero $number turn to move")
    else reach(game.hero.pos to dir) map fights map finalize
  }
}
