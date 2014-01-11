package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Arbiter {

  // crashes the current player and forwards one turn
  def crash(game: Game, c: Crash): Game = game.hero.fold(game) { h =>
    game.withHero(h setCrash c).step
  }

  def move(game: Game, token: String, dir: Dir): Try[Game] = game.hero match {
    case None => Failure(RuleViolationException(s"No hero can play"))
    case Some(hero) =>
      if (hero.token != token) Failure(RuleViolationException(s"Not hero $token turn to move"))
      else if (game.finished) Failure(RuleViolationException(s"Game $game is finished"))
      else Success(doMove(game, hero.id, dir))
  }

  private def doMove(game: Game, id: Int, dir: Dir) = {

    def reach(destPos: Pos) = (game.board get destPos) match {
      case None => game
      case Some(tile) => (game hero destPos) match {
        case Some(_) => game
        case None => tile match {
          case Tile.Air                      => walk(destPos)
          case Tile.Tavern                   => drink
          case Tile.Mine(n) if n != Some(id) => mine(destPos)
          case Tile.Mine(n)                  => game
          case Tile.Wall                     => game
        }
      }
    }

    def walk(pos: Pos) = game.withHero(id, _ moveTo pos)

    def drink = game.withHero(id, _.drinkBeer)

    def mine(pos: Pos) = {
      val h = game.hero(id).fightMine
      if (h.isAlive) game.withHero(h).withBoard(_.transferMine(pos, Some(h.id)))
      else game.withHero(reSpawn(h)).withBoard(_.transferMines(h.id, None))
    }

    @annotation.tailrec
    def reSpawn(h: Hero): Hero = {
      val p1 = Pos(Random nextInt (game.board.size / 2 - 2), Random nextInt (game.board.size / 2 - 2))
      val pos = h.id match {
        case 1 => p1
        case 2 => game.board mirrorX p1
        case 3 => game.board mirrorXY p1
        case 4 => game.board mirrorY p1
      }
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

    def finalize(g: Game) = {
      val h = (g hero id).day withGold g.board.countMines(id)
      if (h.isDead) g.withHero(reSpawn(h)).withBoard(_.transferMines(id, None))
      else g.withHero(h)
    }

    finalize(fights(reach(game.hero(id).pos to dir))).step
  }
}
