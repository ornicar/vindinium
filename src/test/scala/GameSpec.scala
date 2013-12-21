import org.specs2.mutable._
import jousse.org.bot._

class GameSpec extends Specification {

  val rows = 10
  val columns = 10
  val game = Game.create("testGame", rows, columns, Player("Player1"), Player("Player2"))

  "The game" should {
    "be created" in {
      game.id mustEqual "testGame"
    }

    "should have players" in {
      game.board.get(0,0) must beAnInstanceOf[Player]
      game.board.get(rows-1, columns-1) must beAnInstanceOf[Player]
    }
  }
}

