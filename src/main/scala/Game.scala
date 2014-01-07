package jousse.org
package bot

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
  def create(id: String, rows: Int, columns: Int, player1: Player, player2: Player): Game =
    Game(id, Board.empty, player1, player2)
}
