package org.jousse
package bot

import scala.util.Try

case class Board(tiles: Vector[Vector[Tile]]) {

  def get(pos: Pos): Option[Tile] = (tiles lift pos.x).flatMap(_ lift pos.y)

  def update(pos: Pos, tile: Tile): Board = Try {
    tiles.updated(pos.x, tiles(pos.x).updated(pos.y, tile))
  } map Board.apply getOrElse this

  def remove(pos: Pos): Board = update(pos, Tile.Air)

  def size = tiles.length

  def topLeft = Pos(0, 0)
  def topRight = Pos(0, size - 1)
  def bottomLeft = Pos(size - 1, 0)
  def bottomRight = Pos(size - 1, size - 1)

  def isAir(pos: Pos) = get(pos).fold(false)(Tile.Air==)

  override def toString = {

    val stringVector = tiles flatMap { xs =>
      xs.zipWithIndex map {
        case (tile, y) => if (y == 0) s"|$tile" else if (y == size - 1) s"$tile|\n" else tile.toString
      }
    }

    val line = "+" + "--" * size + "+\n"

    line + stringVector.mkString + line
  }
}

object Board {

  def empty = Board(Vector())

  def empty(size: Int) = Board(Vector.fill(size)(Vector.fill(size)(Tile.Air)))
}
