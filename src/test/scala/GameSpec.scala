import org.specs2.mutable._
import jousse.org.bot._

class GameSpec extends Specification {

  val rows = 10
  val columns = 10
  val game = Game.create("testGame", rows, columns, Player(1, "Player1"), Player(2, "Player2"))

  val randomBoard = Board.fillWithRandomWalls(game.board)

  println(game.board)
  println(randomBoard)

  "The game" should {
    "be created" in {
      game.id mustEqual "testGame"
    }

  }
}

