package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Arbiter {

  // crashes the current player and forwards one turn
  def crash(game: Game, c: Crash): Game = game.step(_.withHero(_ setCrash c))

  def move(game: Game, token: String, dir: Dir): Try[Game] =
    if (game.hero.token != token) fail(s"Not hero $token turn to move")
    else doMove(game, dir)

  private def doMove(game: Game, dir: Dir) = {

    val id = game.hero.id

    def reach(destPos: Pos) = game.board get destPos match {
      case None => stay
      case Some(tile) => game hero destPos match {
        case Some(_) => stay
        case None => tile match {
          case Tile.Air                      => walk(destPos)
          case Tile.Tavern                   => drink
          case Tile.Mine(n) if n != Some(id) => mine(destPos)
          case Tile.Mine(n)                  => stay
          case Tile.Wall                     => stay
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
      val h1 = g.hero(id).fightMine
      if (h1.isAlive) g.withHero(h1).withBoard(_.transferMine(pos, Some(h1.id)))
      else g.withHero(reSpawn(h1)).withBoard(_.transferMines(h1.id, None))
    }

    @annotation.tailrec
    def reSpawn(h: Hero): Hero = {
      val pos = Pos(Random nextInt (game.board.size / 2 - 2), Random nextInt (game.board.size / 2 - 2))
      if (Validator.heroPos(game, pos)) h reSpawn pos
      else reSpawn(h)
    }

    def fights(g: Game): Game =
      (g.hero(id).pos.neighbors map g.hero).flatten.foldLeft(g)(attack)

    def attack(g: Game, enemy: Hero): Game = {
      val (h1, h2) = g hero id attack enemy
      List(h1 -> h2, h2 -> h1).foldLeft(g) {
        case (game, (x, y)) => if (x.isDead) game
          .withHero(reSpawn(x))
          .withBoard(_.transferMines(x.id, if (y.isAlive) Some(y.id) else None))
        else game withHero x
      }
    }

    def finalize(g: Game) = g.withHero(id, _.day withGold g.board.countMines(id))

    reach(game.hero.pos to dir) map fights map finalize
  }
}
