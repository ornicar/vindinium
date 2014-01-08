package org.jousse
package bot
import scala.util.{ Try, Success, Failure }

case class Hero(
    number: Int,
    name: String,
    pos: Pos,
    life: Int,
    gold: Int) {

  def render = s"@$number"
}

case class Game(
    id: String,
    board: Board,
    hero1: Hero,
    hero2: Hero,
    hero3: Hero,
    hero4: Hero,
    turn: Int = 0) {

  def heroes = List(hero1, hero2, hero3, hero4)

  def hero: Hero = hero(turn % 4)
  def hero(number: Int): Hero = heroes lift number getOrElse hero1
  def hero(pos: Pos): Option[Hero] = heroes find (_.pos == pos)

  def step(withBoard: Board => Board) = copy(
    turn = turn + 1,
    board = withBoard(board)
  )

  override def toString = {

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
