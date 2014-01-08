package org.jousse
package bot

import scala.util.Try

case class Board(tiles: Vector[Vector[Tile]]) {

  def get(pos: Pos): Option[Tile] = (tiles lift pos.x).flatMap(_ lift pos.y)

  def update(pos: Pos, tile: Tile): Board = Try {
    tiles.updated(pos.x, tiles(pos.x).updated(pos.y, tile))
  } map Board.apply getOrElse {
    println(pos)
    this
  }

  def remove(pos: Pos): Board = update(pos, Tile.Air)

  val size = tiles.length

  def topLeft = Pos(0, 0)
  def topRight = Pos(0, size - 1)
  def bottomLeft = Pos(size - 1, 0)
  def bottomRight = Pos(size - 1, size - 1)

  def isAir(pos: Pos) = get(pos).fold(false)(Tile.Air==)

  def mirrorX(pos: Pos) = pos.copy(x = size - pos.x - 1)
  def mirrorY(pos: Pos) = pos.copy(y = size - pos.y - 1)

  def allPos = (0 to size - 1).toList flatMap { x =>
    (0 to size - 1).toList map { Pos(x, _) }
  }

  override def toString = {

    val stringVector = tiles flatMap { xs =>
      xs.zipWithIndex map {
        case (tile, y) => {
          val x = tile.render
          if (y == 0) s"|$x" else if (y == size - 1) s"$x|\n" else x
        }
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
