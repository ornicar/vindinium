package org.vindinium.server

import scala.util.{ Random, Try, Success, Failure }

object Arbiter {

  def replay(game: Game, dir: Dir): Game = doMove(game, game.heroId, dir)

  def move(game: Game, token: String, dir: Dir): Try[Game] =
    validate(game, token) { hero =>
      doMove(game, hero.id, dir)
    }

  private def validate(game: Game, token: String)(f: Hero => Game): Try[Game] =
    (game.finished, game heroByToken token) match {
      case (true, _) =>
        Failure(RuleViolationException("Game is finished"))
      case (_, None) =>
        Failure(RuleViolationException("Token not found"))
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
      else reSpawn(game, h).withBoard(_.transferMines(h.id, None))
    }

    def reSpawn(g: Game, h: Hero, rec: Int = 0): Game = {
      val pos = g spawnPosOf h
      (g hero pos match {
        case Some(opponent) if opponent.id != h.id =>
          play.api.Logger("Arbiter").info(s"reSpawn rec:$rec game:${game.id} hero:${h.id} ${h.pos} -> $pos")
          if (rec > 4) throw new Exception(s"Arbiter.reSpawn recursion")
          reSpawn(g, opponent, rec + 1)
        case _ => g
      }) withHero (h reSpawn pos)
    }

    def fights(g: Game): Game =
      (g.hero(id).pos.neighbors map g.hero).flatten.foldLeft(g)(attack)

    def attack(g: Game, enemy: Hero): Game = {
      val (h1, h2) = g hero id attack enemy
      List(h1 -> h2, h2 -> h1).foldLeft(g) {
        case (game, (x, y)) =>
          if (x.isDead) reSpawn(game, x).withBoard(_.transferMines(x.id, if (y.isAlive) Some(y.id) else None))
          else game withHero x
      }
    }

    def finalize(g: Game) = {
      val h = (g hero id).day withGold g.board.countMines(id)
      if (h.isDead) reSpawn(g, h).withBoard(_.transferMines(id, None))
      else g withHero h
    }

    if (dir == Dir.Crash) finalize(game.setTimedOut).step
    else finalize(fights(reach(game.hero(id).pos to dir))).step
  }
}
