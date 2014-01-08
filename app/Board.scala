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

  def isAir(pos: Pos) = get(pos).fold(false)(Tile.Air==)

  def mirrorX(pos: Pos) = pos.copy(x = size - pos.x - 1)
  def mirrorY(pos: Pos) = pos.copy(y = size - pos.y - 1)

  def allPos = (0 to size - 1).toList flatMap { x =>
    (0 to size - 1).toList map { Pos(x, _) }
  }

  def transferMine(pos: Pos, to: Option[Int]): Board = update(pos, Tile.Mine(to))

  def transferMines(from: Int, to: Option[Int]): Board = allPos.foldLeft(this) {
    case (b, pos) => b get pos match {
      case Some(Tile.Mine(Some(owner))) if owner == from => transferMine(pos, to)
      case _ => b
    }
  }

  def countMines(of: Int) = tiles.flatten.foldLeft(0) {
    case (c, Tile.Mine(Some(owner))) if owner == of => c + 1
    case (c, _)                                     => c
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
