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
          case Tile.Air    => game.withHero(id, _ moveTo destPos)
          case Tile.Tavern => game.withHero(id, _.drinkBeer)
          case Tile.Mine(n) if n != Some(id) =>
            val h = game.hero(id).fightMine
            if (h.isAlive) game.withHero(h).withBoard(_.transferMine(destPos, Some(h.id)))
            else reSpawn(game.withBoard(_.transferMines(h.id, None)), h)
          case Tile.Mine(n) => game
          case Tile.Wall    => game
        }
      }
    }

    if (dir == Dir.Crash) finalize(game.setTimedOut, id).step
    else finalize(fights(reach(game.hero(id).pos to dir), id), id).step
  }

  private def reSpawn(game: Game, h: Hero, rec: Int = 0): Game = {
    val pos = game spawnPosOf h
    (game hero pos match {
      case Some(opponent) if opponent.id != h.id =>
        // play.api.Logger("Arbiter").info(s"reSpawn rec:$rec game:${game.id} hero:${h.id} ${h.pos} -> $pos")
        if (rec > 4) throw new Exception(s"Arbiter.reSpawn recursion")
        reSpawn(game.withBoard(_.transferMines(opponent.id, Some(h.id))), opponent, rec + 1)
      case _ => game
    }) withHero (h reSpawn pos)
  }

  private def fights(game: Game, id: Int): Game =
    (game.hero(id).pos.neighbors map game.hero).flatten.foldLeft(game)(attack(id))

  private def attack(id: Int)(game: Game, enemy: Hero): Game = {
    val (h1, h2) = game hero id attack enemy
    val g = game.withHero(h1).withHero(h2)
    if (h1.isDead) reSpawn(g.withBoard(_.transferMines(h1.id, Some(h2.id))), h1)
    else if (h2.isDead) reSpawn(g.withBoard(_.transferMines(h2.id, Some(h1.id))), h2)
    else g
  }

  def finalize(game: Game, id: Int) = {
    val h = (game hero id).day withGold game.board.countMines(id)
    if (h.isDead) reSpawn(game, h).withBoard(_.transferMines(id, None))
    else game withHero h
  }
}
