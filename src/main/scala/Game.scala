package jousse.org
package bot
import scala.util.{ Try, Success, Failure }

case class Player(
  number: Int,
  name: String)

case class Game(
  id: String,
  board: Board,
  player1: Player,
  player2: Player
)

object Game {
  def create(id: String, size: Int, player1: Player, player2: Player): Try[Game] =
    Generator(size) map { board => Game(id, board, player1, player2) }
}
