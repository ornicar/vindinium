package org.jousse
package bot

import scala.util.Try

case class Board(tiles: Vector[Vector[Tile]]) {

  def get(pos: Pos): Option[Tile] = (tiles lift pos.x).flatMap(_ lift pos.y)

  def update(pos: Pos, tile: Tile): Board = Try {
    tiles.updated(pos.x, tiles(pos.x).updated(pos.y, tile))
  } map Board.apply getOrElse this

  def remove(pos: Pos): Board = update(pos, Tile.Air)

  val size = tiles.length

  def isAir(pos: Pos) = get(pos).fold(false)(Tile.Air==)

  def mirrorX(pos: Pos) = pos.copy(x = size - pos.x - 1)
  def mirrorY(pos: Pos) = pos.copy(y = size - pos.y - 1)
  def mirrorXY(pos: Pos) = mirrorX(mirrorY(pos))

  def allPos = (0 to size - 1).toList flatMap { x =>
    (0 to size - 1).toList map { Pos(x, _) }
  }

  def posTiles = allPos zip tiles.flatten

  def transferMine(pos: Pos, to: Option[Int]): Board = update(pos, Tile.Mine(to))

  def transferMines(from: Int, to: Option[Int]): Board = allPos.foldLeft(this) {
    case (b, pos) => b get pos match {
      case Some(Tile.Mine(Some(owner))) if owner == from => b.transferMine(pos, to)
      case _ => b
    }
  }

  def countMines(of: Int) = tiles.flatten.foldLeft(0) {
    case (c, Tile.Mine(Some(owner))) if owner == of => c + 1
    case (c, _)                                     => c
  }
  def countMines = tiles.flatten count {
    case Tile.Mine(_) => true
    case _            => false
  }

  def section = Board(tiles = tiles.take(size / 2).map(_.take(size / 2)))

  def render =
    tiles map { _ map (_.render) mkString } mkString "\n"
}

object Board {

  def empty = Board(Vector())

  def empty(size: Int) = Board(Vector.fill(size)(Vector.fill(size)(Tile.Air)))
}
