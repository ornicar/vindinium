package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Generator {

  def apply(
    size: Int,
    attempts: Int = 20,
    wallPercent: Int = 40,
    beerPercent: Int = 3,
    monsterPercent: Int = 5): Try[Game] = {

    def generateBoard(attempt: Int): Try[Board] = {

      def sector(size: Int) = Board {
        (1 to size).toVector map { _ =>
          (1 to size).toVector map { _ =>
            Random.nextInt(100) match {
              case x if x < beerPercent => Tile.Beer
              case x if x < (beerPercent + monsterPercent) => Tile.Monster
              case x if x < (beerPercent + monsterPercent + wallPercent) => Tile.Wall
              case _ => Tile.Air
            }
          }
        }
      }

      def replicate(board: Board) = Board {
        val xs2 = board.tiles map { xs => xs ++ xs.reverse }
        xs2 ++ xs2.reverse
      }

      (size match {
        case s if s < 8      ⇒ Failure(new Exception("Board is too small"))
        case s if s % 2 != 0 ⇒ Failure(new Exception("Board size is odd"))
        case s               ⇒ Validator board replicate(sector(size / 2))
      }) match {
        case Failure(err) if attempt > 0 => {
          val a = attempt - 1
          println(s"$err, $a attempts remaining")
          generateBoard(a)
        }
        case res => res
      }
    }

    generateBoard(attempts) map { board =>

      @annotation.tailrec
      def generateGame: Game = {

        @annotation.tailrec
        def generateHeroPos: Pos = {
          val pos = Pos(Random nextInt (size / 2 - 2), Random nextInt (size / 2 - 2))
          if (board isAir pos) pos else generateHeroPos
        }
        val hp = generateHeroPos

        val game = Game(
          id = RandomString(6),
          board = board,
          hero1 = Hero(1, "Alaric", hp),
          hero2 = Hero(2, "Luther", hp.copy(x = board.size - hp.x - 1)),
          hero3 = Hero(3, "Thorfinn", hp.copy(x = board.size - hp.x - 1, y = board.size - hp.y - 1)),
          hero4 = Hero(4, "York", hp.copy(y = board.size - hp.y - 1))
        )

        if (Validator game game) game else generateGame
      }

      generateGame
    }
  }

  private object RandomString {

    def apply(len: Int) = List.fill(len)(nextChar) mkString

    private val chars: IndexedSeq[Char] = (('0' to '9') ++ ('a' to 'z'))
    private val nbChars = chars.size
    private def nextChar = chars(Random nextInt nbChars)
  }
}
