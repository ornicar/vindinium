package jousse.org
package bot

sealed abstract class Tile(char: Char) {

  override def toString = char.toString
}

object Tile {
  case object Air extends Tile(' ')
  case object Wall extends Tile('#')
  case object Potion extends Tile('!')
  case object Monster extends Tile('&')
  case class Hero(number: Int) extends Tile(number.toString.head)
}
