package org.vindinium.server

import scala.util.Try

case class Board(tiles: Vector[Tile]) {

  def posIndex(pos: Pos): Option[Int] = if (pos isIn size) Some(pos.x * size + pos.y) else None
  def indexPos(index: Int): Pos = Pos(index / size, index % size)

  def get(pos: Pos): Option[Tile] = posIndex(pos) flatMap tiles.lift

  def update(pos: Pos, tile: Tile): Board =
    posIndex(pos).fold(this) { index => Board(tiles.updated(index, tile)) }

  def remove(pos: Pos): Board = update(pos, Tile.Air)

  val size = math.sqrt(tiles.length).toInt

  def isAir(pos: Pos) = get(pos).fold(false)(Tile.Air==)

  def mirrorX(pos: Pos) = pos.copy(x = size - pos.x - 1)
  def mirrorY(pos: Pos) = pos.copy(y = size - pos.y - 1)
  def mirrorXY(pos: Pos) = mirrorX(mirrorY(pos))

  lazy val posTiles = tiles.zipWithIndex map {
    case (tile, index) => indexPos(index) -> tile
  }

  def allPos = posTiles map (_._1)

  def transferMine(pos: Pos, to: Option[Int]): Board = update(pos, Tile.Mine(to))

  def transferMines(from: Int, to: Option[Int]): Board = allPos.foldLeft(this) {
    case (b, pos) => b get pos match {
      case Some(Tile.Mine(Some(owner))) if owner == from => b.transferMine(pos, to)
      case _ => b
    }
  }

  def countMines(of: Int) = tiles count (Tile.Mine(Some(of))==)
  def countMines = tiles count {
    case Tile.Mine(_) => true
    case _            => false
  }

  def section = Board(tiles = tiles.zipWithIndex collect {
    case (tile, index) if (index % size) < (size / 2) => tile
  })

  def render = tiles grouped size map { _ map (_.render) mkString } mkString "\n"
}
