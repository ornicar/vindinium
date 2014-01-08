package org.jousse
package bot

case class Pos(x: Int, y: Int) {

  def left = copy(x = x - 1)
  def right = copy(x = x + 1)
  def up = copy(y = y - 1)
  def down = copy(y = y + 1)

  def neighbors = Set(left, right, up, down)
}

sealed trait Dir
case object Dir {
  case object Up
  case object Down
  case object Left
  case object Right
}

sealed abstract class Tile(char1: Char, char2: Char) {
  override def toString = char1.toString + char2.toString
}
object Tile {
  case object Air extends Tile(' ', ' ')
  case object Wall extends Tile('#', '#')
  case object Potion extends Tile('/', '\\')
  case object Monster extends Tile('o', '<')
  case class Mine(owner: Int) extends Tile('$', owner.toString.head)
  case class Hero(number: Int) extends Tile('@', number.toString.head)
}
