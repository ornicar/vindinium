package jousse.org
package bot

import scala.util.{ Random, Try, Success, Failure }

object Generator {

  def apply(size: Int): Try[Board] = size match {
    case s if s < 8      ⇒ Failure(new Exception("Board is too small"))
    case s if s % 2 != 0 ⇒ Failure(new Exception("Board size is odd"))
    case s ⇒ addHeroes(replicate(sector(size / 2))) match {
      case Some(board) => Success(board)
      case None        => Failure(new Exception("Board generation failed miserably"))
    }
  }

  private def sector(size: Int) = Board {
    (1 to size).toVector map { _ =>
      (1 to size).toVector map { _ =>
        Random.nextInt(20) match {
          case 0           => Tile.Potion
          case 1           => Tile.Monster
          case x if x < 10 => Tile.Wall
          case _           => Tile.Air
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

  private def addHeroes(board: Board) = for {
    b1 <- board.updated(board.topLeft, Tile Hero 1)
    b2 <- b1.updated(board.topRight, Tile Hero 2)
    b3 <- b2.updated(board.bottomLeft, Tile Hero 3)
    b4 <- b3.updated(board.bottomRight, Tile Hero 4)
  } yield b4
}
