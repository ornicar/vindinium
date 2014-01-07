package jousse.org
package bot

case class Board(tiles: Vector[Vector[Tile]]) {

  def get(pos: Pos) : Option[Tile] = (tiles lift pos.x).flatMap( _ lift pos.y)

  def up(pos: Pos, tile: Tile): Option[Board] = scala.util.Try(tiles.updated(pos.x, tiles(pos.x).updated(pos.y, tile))).toOption match {
    case Some(b) => Some(Board(b))
    case _       => None
  }

  def nbColumns = ((tiles lift 0).getOrElse(Vector())).length

  def nbRows = tiles.length

  def nbTiles = nbRows * nbColumns

  def thingAtPositionToString(tile: Tile, pos: Pos) : String = {

    if(pos.y == 0) {
      "|" + tile
    } else if (pos.y == nbColumns-1) {
      tile + "|\n"
    } else {
      tile.toString
    }
  }

  /**
   * Return the grid to the following format:
   *
   * +----------+
   * |2XXXXXXXXX|
   * |XXXXXXXXXX|
   * |XXXXXXXXXX|
   * |XXXXXXXXXX|
   * |XXXXXXXXXX|
   * |XXXXXXXXXX|
   * |XXXXXXXXXX|
   * |XXXXXXXXXX|
   * |XXXXXXXXXX|
   * |XXXXXXXXX1|
   * +----------+
   **/

  override def toString = {

    val stringVector = for{
         (thingVector, x) <- tiles.zipWithIndex
         (thing, y) <- thingVector.zipWithIndex
    } yield(thingAtPositionToString(thing, Pos(x, y)))

    val line = "+" + "-" * nbColumns + "+\n"

    line + stringVector.mkString + line
  }
}

object Board {

  def empty = Board(Vector())

  def empty(size: Int) = Board(Vector.fill(size)(Vector.fill(size)(Tile.Air)))
}
