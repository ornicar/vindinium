package jousse.org
package bot

case class Board(board: Vector[Vector[Tile]]) {

  def get(pos: Pos) : Option[Tile] = (board lift pos.x).flatMap( _ lift pos.y)

  def up(pos: Pos, tile: Tile): Option[Board] = scala.util.Try(board.updated(pos.x, board(pos.x).updated(pos.y, tile))).toOption match {
    case Some(b) => Some(Board(b))
    case _       => None
  }

  def nbColumns = ((board lift 0).getOrElse(Vector())).length

  def nbRows = board.length

  def nbTiles = nbRows * nbColumns

  def thingAtPositionToString(thing: Tile, pos: Pos) : String = {

    def thingToString(thing: Tile): String = thing match {
      case Player(number, _) => number.toString
      case Wall() => "X"
      case _ => " "
    }

    if(pos.y == 0) {
      "|" + thingToString(thing)
    } else if (pos.y == nbColumns-1) {
      thingToString(thing) + "|\n"
    } else {
      thingToString(thing)
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
         (thingVector, x) <- board.zipWithIndex
         (thing, y) <- thingVector.zipWithIndex
    } yield(thingAtPositionToString(thing, Pos(x, y)))

    val line = "+" + "-" * nbColumns + "+\n"

    line + stringVector.mkString + line
  }
}

object Board {

  def initialize(rows: Int, columns: Int, player1: Player, player2: Player) : Board = {

    val rnd = new scala.util.Random
    val range = 1 to 2
    val rdnValue = range(rnd.nextInt(range.length))

    Board( Vector.tabulate(columns, rows){ (i,j) => (i,j) match {
      case (0,0)                                      => if(rdnValue == 1) player1 else player2
      case (x,y) if x == (columns-1) && y == (rows-1) => if(rdnValue == 1) player2 else player1
      case _                                          => new Tile()
    }} )
  }

  def fillWithRandomWalls(board: Board, wallPercentage: Int = 20) : Board = {

    //Let's say we want a fixed percentage of walls
    val nbWalls : Int = board.nbTiles * wallPercentage / 100
    println(s"willFill ${nbWalls} walls")

    def fillBoard(board: Board, totalWalls: Int = nbWalls, currentWallNumber: Int = 0): Board =
      (nbWalls, currentWallNumber) match {
      //There is nothing to fill
      case (0, 0)                           => board
      //We have filled everything
      case (max, current) if max == current => board
      case _                                => fillBoard(
        fillRandomTileWithWall(board).getOrElse(board),
        totalWalls,
        currentWallNumber + 1)
    }

    fillBoard(board, nbWalls, 0)
  }


  def fillRandomTileWithWall(board: Board): Option[Board] = {
    val randomPosition = getRandomPos(board)
    board.get(randomPosition) match {
      case Some(Player(_,_)) => None
      case Some(Wall())      => None
      case None              => None
      case _                 => board.up(randomPosition, Wall())

    }
  }

  def getRandomPos(board: Board): Pos = {

    val rnd = new scala.util.Random
    val range = 0 to math.max((board.nbRows-1),(board.nbColumns-1))
    val xRandomValue = range(rnd.nextInt(range.length))
    val yRandomValue = range(rnd.nextInt(range.length))

    Pos(xRandomValue, yRandomValue)

  }

}
