package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Generator {

  def apply(
    size: Int,
    attempts: Int = 20,
    wallPercent: Int = 40,
    potionPercent: Int = 3,
    monsterPercent: Int = 5): Try[Board] = {

    def sector(size: Int) = Board {
      (1 to size).toVector map { _ =>
        (1 to size).toVector map { _ =>
          Random.nextInt(100) match {
            case x if x < potionPercent => Tile.Potion
            case x if x < (potionPercent + monsterPercent) => Tile.Monster
            case x if x < (potionPercent + monsterPercent + wallPercent) => Tile.Wall
            case _ => Tile.Air
          }
        }
      }
    }

    def replicate(board: Board) = Board {
      val xs2 = board.tiles map { xs => xs ++ xs.reverse }
      xs2 ++ xs2.reverse
    }

    def addHeroes(board: Board) = (for {
      b1 <- board.updated(board.topLeft, Tile Hero 1)
      b2 <- b1.updated(board.topRight, Tile Hero 2)
      b3 <- b2.updated(board.bottomLeft, Tile Hero 3)
      b4 <- b3.updated(board.bottomRight, Tile Hero 4)
    } yield b4) match {
      case Some(board) => Success(board)
      case None        => Failure(new Exception("Can't add heroes to the board"))
    }

    (size match {
      case s if s < 8      ⇒ Failure(new Exception("Board is too small"))
      case s if s % 2 != 0 ⇒ Failure(new Exception("Board size is odd"))
      case s               ⇒ addHeroes(replicate(sector(size / 2))) flatMap Validator.apply
    }) match {
      case Failure(err) if attempts > 0 => {
        val a = attempts - 1
        println(s"$err, $a attempts remaining")
        apply(size, a)
      }
      case res => res
    }
  }
}
