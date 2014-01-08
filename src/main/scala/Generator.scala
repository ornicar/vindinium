package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Generator {

  def apply(
    size: Int,
    attempts: Int = 20,
    wallPercent: Int = 40,
    potionPercent: Int = 3,
    monsterPercent: Int = 5): Try[Game] = {

    def generateBoard(attempt: Int): Try[Board] = {

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

      (size match {
        case s if s < 8      ⇒ Failure(new Exception("Board is too small"))
        case s if s % 2 != 0 ⇒ Failure(new Exception("Board size is odd"))
        case s               ⇒ Validator(replicate(sector(size / 2)))
      }) match {
        case Failure(err) if attempt > 0 => {
          val a = attempt - 1
          println(s"$err, $a attempts remaining")
          generateBoard(a)
        }
        case res => res
      }
    }

    def mkHero(number: Int, name: String, pos: Pos) = Hero(
      number = number,
      name = name,
      pos = pos,
      life = 100,
      gold = 0)

    generateBoard(attempts) map { board =>

      @annotation.tailrec
      def generateHeroPos: Pos = {
        val pos = Pos(Random nextInt (size - 2), Random nextInt (size - 2))
        if (board isAir pos) pos else generateHeroPos
      }
      val hp = generateHeroPos

      Game(
        id = RandomString(6),
        board = board,
        hero1 = mkHero(1, "Alaric", hp),
        hero2 = mkHero(2, "Luther", hp.copy(x = board.size - hp.x)),
        hero3 = mkHero(3, "Thorfinn", hp.copy(x = board.size - hp.x, y = board.size - hp.y)),
        hero4 = mkHero(4, "York", hp.copy(y = board.size - hp.y))
      )
    }
  }

  private object RandomString {

    def apply(len: Int) = List.fill(len)(nextChar) mkString

    private val chars: IndexedSeq[Char] = (('0' to '9') ++ ('a' to 'z'))
    private val nbChars = chars.size
    private def nextChar = chars(Random nextInt nbChars)
  }
}
