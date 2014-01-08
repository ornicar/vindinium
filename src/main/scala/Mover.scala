package jousse.org
package bot

import scala.util.{ Try, Success, Failure }

object Mover {

  def apply(board: Board, from: Pos, to: Pos): Try[Board] = {

    if(from.neighbors(to)) {

      board get from match {
        case Some(Tile.Hero(_)) => board get to match {
          case Some(Tile.Hero(_)) => Failure(new Exception("You can't move to another Hero"))
          case Some(Tile.Wall)    => Failure(new Exception("You can't move to a wall"))
          case _                  => Success(board)
        }
        case _ => Failure(new Exception("You can only move heroes"))
      }

    }
    else Failure(new Exception("You can only move to a neighbor tile"))

  }
}

