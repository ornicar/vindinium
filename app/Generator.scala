package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Generator {

  val maxAttempts = 100

  def apply(config: Config.GenMap, turns: Int, training: Boolean): Try[Game] = config.size match {
    case s if s < 8      ⇒ fail("Board is too small")
    case s if s % 2 != 0 ⇒ fail("Board size is odd")
    case _               ⇒ attempt(config, turns, training)
  }

  private def attempt(config: Config.GenMap, turns: Int, training: Boolean, attempts: Int = 1): Try[Game] = {

    val boardDraft = generateBoard(config)

    generateSpawnPos(boardDraft) flatMap { spawnPos =>

      val board = fillBoard(boardDraft, spawnPos)

      if (board.countMines == 0) fail("Board has no mine")
      else placeTaverns(board, spawnPos, config) map { finalBoard =>
        generateGame(finalBoard, config, turns, training, spawnPos)
      }
    }
  } recoverWith {
    case err if attempts < maxAttempts => {
      attempt(config, turns, training, attempts + 1)
    }
  }

  private def generateGame(board: Board, config: Config.GenMap, turns: Int, training: Boolean, spawnPos: Pos) = Game(
    id = RandomString(8),
    training = training,
    board = board,
    hero1 = Hero(1, "Alaric", None, None, spawnPos),
    hero2 = Hero(2, "Luther", None, None, board mirrorX spawnPos),
    hero3 = Hero(3, "Thorfinn", None, None, board mirrorXY spawnPos),
    hero4 = Hero(4, "York", None, None, board mirrorY spawnPos),
    spawnPos = spawnPos,
    maxTurns = turns,
    status = Status.Created)

  private def placeTaverns(board: Board, heroPos: Pos, config: Config.GenMap): Try[Board] = {

    def nbReachableMines(b: Board) = b.posTiles count {
      case (p, Tile.Mine(_)) => p.neighbors map b.get exists (Some(Tile.Air)==)
      case _                 => false
    }
    val reachable = Traverser(board, heroPos)
    val nbMines = nbReachableMines(board)

    def doPlace(poss: List[Pos]): Try[Board] = poss match {
      case Nil => fail("No place found for a tavern")
      case pos :: rest => {
        val b2 = List(pos, board mirrorX pos, board mirrorXY pos, board mirrorY pos).foldLeft(board) {
          case (b, p) => b.update(p, Tile.Tavern)
        }
        val reachable2 = Traverser(b2, heroPos)
        if (reachable2.size == reachable.size - 4 && nbReachableMines(b2) == nbMines) Success(b2)
        else doPlace(rest)
      }
    }

    doPlace(Random.shuffle(Traverser(board.section, heroPos).toList))
  }

  private def generateSpawnPos(board: Board, attempts: Int = 1): Try[Pos] = {
    val pos = Pos(Random nextInt (board.size / 2 - 2), Random nextInt (board.size / 2 - 2))
    if (validateSpawnPos(board, pos)) Success(pos)
    else fail("Can't find a good starting position")
  } recoverWith {
    case err if attempts < maxAttempts => generateSpawnPos(board, attempts + 1)
  }

  private def fillBoard(board: Board, spawnPos: Pos) = {
    val reachable = Traverser(board, spawnPos)
    board.allPos.diff(reachable).foldLeft(board) {
      case (b, pos) => b get pos match {
        case Some(Tile.Mine(_)) =>
          if (reachable exists { _ closeTo pos }) b
          else b.update(pos, Tile.Wall)
        case _ => b.update(pos, Tile.Wall)
      }
    }
  }

  private def generateBoard(config: Config.GenMap): Board = {

    def sector(size: Int) = Board {
      (1 to math.pow(size, 2).toInt).toVector map { _ =>
        Random.nextInt(100) match {
          case x if x < config.minePercent => Tile.Mine(None)
          case x if x < (config.minePercent + config.wallPercent) => Tile.Wall
          case _ => Tile.Air
        }
      }
    }

    def replicate(board: Board) = Board {
      val vects = (board.tiles grouped board.size).toVector
      val xs2 = vects map { xs => xs ++ xs.reverse }
      val all = xs2 ++ xs2.reverse
      all.flatten
    }

    replicate(sector(config.size / 2))
  }

  def validateSpawnPos(b: Board, pos: Pos): Boolean = (b isAir pos) && {
    val traverse = Traverser(b, pos)
    (traverse contains b.mirrorX(pos)) &&
      (traverse contains b.mirrorY(pos))
  }

  private def fail(err: String) = scala.util.Failure(bot.GeneratorException(err))
}
