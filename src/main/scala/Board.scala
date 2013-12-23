package jousse.org
package bot

case class Board(board: Vector[Vector[Thing]]) {

  def get(x: Int, y: Int) : Option[Thing] = (board lift x).flatMap( _ lift y)

  def nbColumns = ((board lift 0).getOrElse(Vector())).length

  def nbRows = board.length

  def thingAtPositionToString(thing: Thing, x: Int, y: Int) : String = {

    def thingToString(thing: Thing): String = thing match {
      case Player(number, _) => number.toString
      case _ => "X"
    }

    if(y == 0) {
      "|" + thingToString(thing)
    } else if (y == nbColumns-1) {
      thingToString(thing) + "|\n"
    } else {
      thingToString(thing)
    }
  }

  override def toString = {

    val stringVector = for{
         (thingVector, x) <- board.zipWithIndex
         (thing, y) <- thingVector.zipWithIndex
    } yield(thingAtPositionToString(thing, x, y))

    val line = "+" + "-" * nbColumns + "+\n"

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
