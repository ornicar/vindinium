import org.specs2.mutable._
import jousse.org.bot._

class GameSpec extends Specification {

  val game = Game.create("testGame", 10, 10, Player("Player1"), Player("Player2"))

  "The game" should {
    "be created" in {
      game mustEqual Game("testGame", Board(10, 10), Player("Player1"), Player("Player2"))
    }
  }
}

