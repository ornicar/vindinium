package org.jousse
package bot

case class Pos(x: Int, y: Int) {

  def left = copy(x = x - 1)
  def right = copy(x = x + 1)
  def up = copy(y = y - 1)
  def down = copy(y = y + 1)

  def neighbors = Set(left, right, up, down)

  def to(dir: Dir) = dir match {
    case Dir.Up    => up
    case Dir.Down  => down
    case Dir.Left  => left
    case Dir.Right => right
  }
}

sealed trait Dir
case object Dir {
  case object Up extends Dir
  case object Down extends Dir
  case object Left extends Dir
  case object Right extends Dir
}

sealed abstract class Tile(char1: Char, char2: Char) {
  def render = char1.toString + char2.toString
}
object Tile {
  case object Air extends Tile(' ', ' ')
  case object Wall extends Tile('#', '#')
  case object Beer extends Tile(' ', 'ó')
  case class Mine(owner: Option[Int]) extends Tile('$', owner.fold('-')(_.toString.head))
}

sealed trait Finish
object Finish {
  case object TurnMax extends Finish
  case class GoldWin(hero: Hero) extends Finish
}
