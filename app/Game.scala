package org.jousse
package bot
import scala.util.{ Try, Success, Failure }

case class Game(
    id: String,
    board: Board,
    hero1: Hero,
    hero2: Hero,
    hero3: Hero,
    hero4: Hero,
    turn: Int = 0,
    maxTurns: Int,
    status: Status) {

  def heroes = List(hero1, hero2, hero3, hero4)
  def activeHeroes = heroes filterNot (_.crashed)

  // TODO fixme, this will break if all heroes have crashed
  def hero: Option[Hero] = activeHeroes lift (turn % activeHeroes.size)
  def hero(id: Int): Hero = heroes find (_.id == id) getOrElse hero1
  def hero(pos: Pos): Option[Hero] = heroes find (_.pos == pos)

  def step = {
    val next = copy(turn = turn + 1)
    next.copy(
      status = if (next.turn > maxTurns) Status.TurnMax
      else if (next.activeHeroes.isEmpty) Status.AllCrashed
      else Status.Started)
  }

  def withHero(hero: Hero): Game = withHero(hero.id, _ => hero)

  def withHero(id: Int, f: Hero => Hero): Game = copy(
    hero1 = if (id == 1) f(hero1) else hero1,
    hero2 = if (id == 2) f(hero2) else hero2,
    hero3 = if (id == 3) f(hero3) else hero3,
    hero4 = if (id == 4) f(hero4) else hero4)

  def withBoard(f: Board => Board) = copy(board = f(board))

  def finished = status.finished

  override def toString = s"Game[$id]: $status, turn $turn"

  def render = {

    val stringVector = board.tiles.zipWithIndex flatMap {
      case (xs, x) => xs.zipWithIndex map {
        case (tile, y) => {
          val s = hero(Pos(x, y)).fold(tile.render)(_.render)
          if (y == 0) s"|$s"
          else if (y == board.size - 1) s"$s|\n"
          else s
        }
      }
    }

    val line = "+" + "--" * board.size + "+\n"

    line + stringVector.mkString + line
  }
}
