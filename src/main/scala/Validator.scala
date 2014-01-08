package org.jousse
package bot

import scala.util.{ Try, Success, Failure }

object Validator {

  def apply(board: Board): Try[Board] = {

    val accessible = Traverser(board, board.topLeft).toSet

    if (accessible(board.topRight) &&
      accessible(board.bottomLeft) &&
      accessible(board.bottomRight)) Success(board)
    else Failure(new Exception("The players can't reach each other"))
  }
}
