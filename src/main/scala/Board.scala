package jousse.org
package bot

case class Board(board: Vector[Vector[Thing]]) {

  def get(x: Int, y: Int) : Option[Thing] = (board lift x).flatMap( _ lift y)

  def thingAtPositionToString(thing: Thing, x: Int, y: Int, rows: Int, cols: Int) : String = {
    if(y == 0) {
      "|X"
    } else if (y == cols-1) {
      "X|\n"
    } else {
      "X"
    }
  }

  override def toString = {

    val columns = ((board lift 0).getOrElse(Vector())).length
    val dashes = (List.fill(columns)("-")).mkString

    val stringVector = for{
         (thingVector, x) <- board.zipWithIndex
         (thing, y) <- thingVector.zipWithIndex
    } yield(thingAtPositionToString(thing, x, y, board.length, thingVector.length))

    val line = "+" + dashes + "+\n"

    line + stringVector.mkString + line
  }
}

object Board {

  def initialize(columns: Int, rows: Int, player1: Player, player2: Player) : Board = {

    val rnd = new scala.util.Random
    val range = 1 to 2
    val rdnValue = range(rnd.nextInt(range.length))

    Board( Vector.tabulate(columns, rows){ (i,j) => (i,j) match {
      case (0,0)                                      => if(rdnValue == 1) player1 else player2
      case (x,y) if x == (columns-1) && y == (rows-1) => if(rdnValue == 1) player2 else player1
      case _                                          => new Thing()
    }} )
  }

}
