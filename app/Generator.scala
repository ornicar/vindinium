package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Generator {

  val maxAttempts = 100

  def apply(config: Config): Try[Game] = config.size match {
    case s if s < 8      ⇒ fail("Board is too small")
    case s if s % 2 != 0 ⇒ fail("Board size is odd")
    case _               ⇒ attempt(config)
  }

  private def attempt(config: Config, attempts: Int = 1): Try[Game] = {

    val boardDraft = generateBoard(config)

    generateHeroPos(boardDraft) flatMap { heroPos =>

      val board = fillBoard(boardDraft, heroPos)

      if (board.countMines == 0) fail("Board has no mine")
      else placeTaverns(board, heroPos, config) map { finalBoard =>
        generateGame(finalBoard, config, heroPos)
      }
    }
  } recoverWith {
    case err if attempts < maxAttempts => {
      println(s"$err, attempt $attempts/$maxAttempts")
      attempt(config, attempts + 1)
    }
  }

  private def generateGame(board: Board, config: Config, heroPos: Pos) = Game(
    id = RandomString(6),
    board = board,
    config = config,
    hero1 = Hero(1, "Alaric", heroPos),
    hero2 = Hero(2, "Luther", board mirrorX heroPos),
    hero3 = Hero(3, "Thorfinn", board mirrorXY heroPos),
    hero4 = Hero(4, "York", board mirrorY heroPos)
  )

  private def placeTaverns(board: Board, heroPos: Pos, config: Config): Try[Board] = {

    val reachable = Traverser(board, heroPos)

    def doPlace(poss: List[Pos]): Try[Board] = poss match {
      case Nil => fail("No place found for a tavern")
      case pos :: rest => {
        val b2 = List(pos, board mirrorX pos, board mirrorXY pos, board mirrorY pos).foldLeft(board) {
          case (b, p) => b.update(p, Tile.Tavern)
        }
        if (Traverser(b2, heroPos).size == reachable.size - 4) Success(b2)
        else doPlace(rest)
      }
    }

    doPlace(Random.shuffle(Traverser(board.section, heroPos).toList))
  }

  private def generateHeroPos(board: Board, attempts: Int = 1): Try[Pos] = {
    val pos = Pos(Random nextInt (board.size / 2 - 2), Random nextInt (board.size / 2 - 2))
    if (Validator.heroPos(board, pos)) Success(pos)
    else fail("Can't find a good starting position")
  } recoverWith {
    case err if attempts < maxAttempts => generateHeroPos(board, attempts + 1)
  }

  private def fillBoard(board: Board, heroPos: Pos) = {
    val reachable = Traverser(board, heroPos)
    board.allPos.diff(reachable).foldLeft(board) {
      case (b, pos) => b get pos match {
        case Some(Tile.Mine(_)) =>
          if (reachable exists { _ closeTo pos }) b
          else b.update(pos, Tile.Wall)
        case _ => b.update(pos, Tile.Wall)
      }
    }
  }

  private def generateBoard(config: Config): Board = {

    def sector(size: Int) = Board {
      (1 to size).toVector map { _ =>
        (1 to size).toVector map { _ =>
          Random.nextInt(100) match {
            case x if x < config.minePercent => Tile.Mine(None)
            case x if x < (config.minePercent + config.wallPercent) => Tile.Wall
            case _ => Tile.Air
          }
        }
      }
    }

    def replicate(board: Board) = Board {
      val xs2 = board.tiles map { xs => xs ++ xs.reverse }
      xs2 ++ xs2.reverse
    }

    replicate(sector(config.size / 2))
  }

  private object RandomString {

    def apply(len: Int) = List.fill(len)(nextChar) mkString

    private val chars: IndexedSeq[Char] = (('0' to '9') ++ ('a' to 'z'))
    private val nbChars = chars.size
    private def nextChar = chars(Random nextInt nbChars)
  }
}
