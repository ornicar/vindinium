import org.specs2.mutable._
import jousse.org.bot._

class BoardSpec extends Specification {

  val rows = 10
  val columns = 10
  val board = Board.initialize(rows, columns, Player(1, "Player1"), Player(2, "Player2"))

  "The board" should {
    "be updated with a valid pos" in {
      board.up(Pos(1,1), Wall()) must beSome
    }

    "not be updated with an invalid pos" in {
      board.up(Pos(0,rows+1), Wall()) must beNone
    }

  }
}


