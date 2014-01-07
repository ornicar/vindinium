import org.specs2.mutable._
import jousse.org.bot._

class BoardSpec extends Specification {

  val size = 10
  val board = Board.empty(size)

  "The board" should {
    "be updated with a valid pos" in {
      board.updated(Pos(1,1), Tile.Wall) must beSome
    }

    "not be updated with an invalid pos" in {
      board.updated(Pos(0,size+1), Tile.Wall) must beNone
    }

  }
}


