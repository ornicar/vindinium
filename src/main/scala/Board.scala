package org.jousse
package bot

case class Board(tiles: Vector[Vector[Tile]]) {

  def get(pos: Pos): Option[Tile] = (tiles lift pos.x).flatMap(_ lift pos.y)

  def updated(pos: Pos, tile: Tile): Option[Board] =
    scala.util.Try(tiles.updated(pos.x, tiles(pos.x).updated(pos.y, tile))).toOption map Board.apply

  def size = tiles.length

  def topLeft = Pos(0, 0)
  def topRight = Pos(0, size - 1)
  def bottomLeft = Pos(size - 1, 0)
  def bottomRight = Pos(size - 1, size - 1)

  def isAir(pos: Pos) = get(pos).fold(false)(Tile.Air==)

  override def toString = {

    def thingAtPositionToString(tile: Tile, pos: Pos): String =
      if (pos.y == 0) "|" + tile
      else if (pos.y == size - 1) tile + "|\n"
      else tile.toString

    val stringVector = for {
      (thingVector, x) <- tiles.zipWithIndex
      (thing, y) <- thingVector.zipWithIndex
    } yield thingAtPositionToString(thing, Pos(x, y))

    val line = "+" + "--" * size + "+\n"

    line + stringVector.mkString + line
  }
}

object Board {

  def empty = Board(Vector())

  def empty(size: Int) = Board(Vector.fill(size)(Vector.fill(size)(Tile.Air)))
}
