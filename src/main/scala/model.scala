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

sealed abstract class Tile(char: Char) {
  override def toString = char.toString
}
object Tile {
  case object Air extends Tile(' ')
  case object Wall extends Tile('#')
  case object Potion extends Tile('!')
  case object Monster extends Tile('x')
  case class Hero(number: Int) extends Tile(number.toString.head)
}
