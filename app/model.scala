package org.jousse
package bot

case class Pos(x: Int, y: Int) {

  val north = copy(y = y - 1)
  val south = copy(y = y + 1)
  val east = copy(x = x + 1)
  val west = copy(x = x - 1)

  val neighbors = Set(north, south, east, west)

  val closeTo = neighbors contains _

  def to(dir: Dir) = dir match {
    case Dir.Stay  => this
    case Dir.North => north
    case Dir.South => south
    case Dir.East  => east
    case Dir.West  => west
  }
}

sealed trait Dir
case object Dir {
  case object Stay extends Dir
  case object North extends Dir
  case object South extends Dir
  case object West extends Dir
  case object East extends Dir
}

sealed abstract class Tile(char1: Char, char2: Char) {
  def render = char1.toString + char2.toString
}
object Tile {
  case object Air extends Tile(' ', ' ')
  case object Wall extends Tile('#', '#')
  case object Tavern extends Tile('[', ']')
  case class Mine(owner: Option[Int]) extends Tile('$', owner.fold('-')(_.toString.head))
}

sealed trait Finish
object Finish {
  case object TurnMax extends Finish
  case class GoldWin(hero: Hero) extends Finish
}
