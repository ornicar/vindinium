import org.specs2.mutable._
import org.jousse.bot._

class BoardSpec extends Specification {

  val size = 10
  val board = Board.empty(size)

  "The board" should {
    "be updated with a valid pos" in {
      board.update(Pos(1,1), Tile.Wall) must_!= board
    }

    "not be updated with an invalid pos" in {
      board.update(Pos(0,size+1), Tile.Wall) must_== board
    }

  }
}


