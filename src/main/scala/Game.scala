package org.jousse
package bot
import scala.util.{ Try, Success, Failure }

case class Player(
  number: Int,
  name: String,
  life: Int,
  gold: Int)

case class Game(
    id: String,
    board: Board,
    player1: Player,
    player2: Player,
    player3: Player,
    player4: Player,
    turn: Int = 0) {

  def players = List(player1, player2, player3, player4)

  def player = players lift (turn % 4) getOrElse player1

  def step(withBoard: Board => Board) = copy(
    turn = turn + 1,
    board = withBoard(board)
  )
}
