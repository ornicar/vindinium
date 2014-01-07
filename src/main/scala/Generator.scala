package jousse.org
package bot

import scala.util.{ Random, Try, Success, Failure }

object Generator {

  def apply(size: Int): Try[Board] = size match {
    case s if s < 8      ⇒ Failure(new Exception("Board is too small"))
    case s if s % 2 != 0 ⇒ Failure(new Exception("Board size is odd"))
    case s               ⇒ Success(replicate(sector(size / 2)))
  }

  private def sector(size: Int) = Board {
    (1 to size).toVector map { _ =>
      (1 to size).toVector map { _ =>
        Random.nextInt(12) match {
          case 0          => Tile.Potion
          case 1          => Tile.Monster
          case x if x < 5 => Tile.Wall
          case _          => Tile.Air
        }
      }
    }
  }

  private def replicate(board: Board) = Board {
    val xs2 = board.tiles map { xs =>
      xs ++ xs.reverse
    }
    xs2 ++ xs2.reverse
  }
}
