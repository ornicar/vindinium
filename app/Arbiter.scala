package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Arbiter {

  def move(game: Game, token: String, dir: Dir): Try[Game] =
    validate(game, token) { hero =>
      doMove(game, hero.id, dir)
    }

  def crash(game: Game, token: String): Try[Game] =
    validate(game, token) { hero =>
      game.crash(Crash.Timeout).step
    }

  private def validate(game: Game, token: String)(f: Hero => Game): Try[Game] =
    (game.finished, game heroByToken token) match {
      case (true, _) =>
        Failure(RuleViolationException("Game is finished"))
      case (_, None) =>
        Failure(RuleViolationException("Token not found"))
      case (_, Some(hero)) if hero.crashed =>
        Failure(RuleViolationException(s"Hero has crashed: ${hero.crash.getOrElse("?")}"))
      case (_, Some(hero)) if game.hero != Some(hero) =>
        Failure(RuleViolationException(s"Not your turn to move"))
      case (_, Some(hero)) => Success(f(hero))
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
    def reSpawn(h: Hero, attempts: Int = 0): Hero = {
      val halfSize = game.board.size / 2
      val range =
        if (attempts < 10) halfSize - 2
        else if (attempts < 20) halfSize - 1
        else if (attempts < 30) halfSize
        else if (attempts < 500) game.board.size
        else sys error s"FUUUUUUUCK Can't respawn hero $h on game $game"
      val p1 = Pos(Random nextInt range, Random nextInt range)
      val pos = h.id match {
        case _ if range == game.board.size => p1
        case 1 => p1
        case 2 => game.board mirrorX p1
        case 3 => game.board mirrorXY p1
        case 4 => game.board mirrorY p1
      }
      if (Validator.heroPos(game, pos)) h reSpawn pos
      else reSpawn(h, attempts + 1)
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
