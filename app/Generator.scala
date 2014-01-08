package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Generator {

  def apply(
    config: Config,
    maxAttempts: Int = 20): Try[Game] = config.size match {
    case s if s < 8      ⇒ fail("Board is too small")
    case s if s % 2 != 0 ⇒ fail("Board size is odd")
    case _ ⇒ {

      import config._

      def generateGame(gameAttempts: Int): Try[Game] = {

        def sector(size: Int) = Board {
          (1 to size).toVector map { _ =>
            (1 to size).toVector map { _ =>
              Random.nextInt(100) match {
                case x if x < beerPercent => Tile.Beer
                case x if x < (beerPercent + minePercent) => Tile.Mine(None)
                case x if x < (beerPercent + minePercent + wallPercent) => Tile.Wall
                case _ => Tile.Air
              }
            }
          }
        }

        def replicate(board: Board) = Board {
          val xs2 = board.tiles map { xs => xs ++ xs.reverse }
          xs2 ++ xs2.reverse
        }

        val boardDraft = replicate(sector(size / 2))

        if (!Validator.board(boardDraft)) fail("The board has no mine")
        else {

          @annotation.tailrec
          def generateHeroPos(posAttempts: Int): Try[Pos] = {
            val pos = Pos(Random nextInt (size / 2 - 2), Random nextInt (size / 2 - 2))
            if (Validator.heroPos(boardDraft, pos)) Success(pos)
            else if (posAttempts < maxAttempts) generateHeroPos(posAttempts + 1)
            else fail("Can't find a good starting position")
          }

          generateHeroPos(1) map { hp =>
            val board = boardDraft.allPos.diff(Traverser(boardDraft, hp)).foldLeft(boardDraft) {
              case (b, pos) => b.update(pos, Tile.Wall)
            }
            Game(
              id = RandomString(6),
              board = board,
              config = config,
              hero1 = Hero(1, "Alaric", hp),
              hero2 = Hero(2, "Luther", hp.copy(x = board.size - hp.x - 1)),
              hero3 = Hero(3, "Thorfinn", hp.copy(x = board.size - hp.x - 1, y = board.size - hp.y - 1)),
              hero4 = Hero(4, "York", hp.copy(y = board.size - hp.y - 1))
            )
          }
        } recoverWith {
          case err if gameAttempts < maxAttempts => {
            println(s"$err, attempt $gameAttempts/$maxAttempts")
            generateGame(gameAttempts + 1)
          }
        }
      }

      generateGame(1)
    }
  }

  private object RandomString {

    def apply(len: Int) = List.fill(len)(nextChar) mkString

    private val chars: IndexedSeq[Char] = (('0' to '9') ++ ('a' to 'z'))
    private val nbChars = chars.size
    private def nextChar = chars(Random nextInt nbChars)
  }
}
