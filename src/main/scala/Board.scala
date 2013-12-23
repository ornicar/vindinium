package jousse.org
package bot

case class Board(board: Vector[Vector[Thing]]) {

  def get(x: Int, y: Int) : Option[Thing] = (board lift x).flatMap( _ lift y)

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
