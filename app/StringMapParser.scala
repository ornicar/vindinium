package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object StringMapParser {

  case class Parsed(board: Board, pos1: Pos, pos2: Pos, pos3: Pos, pos4: Pos) {

    def game(turns: Int) = Game(
      id = RandomString(8),
      training = true,
      board = board,
      hero1 = Hero(1, "Alaric", None, None, pos1),
      hero2 = Hero(2, "Luther", None, None, pos2),
      hero3 = Hero(3, "Thorfinn", None, None, pos3),
      hero4 = Hero(4, "York", None, None, pos4),
      maxTurns = turns,
      status = Status.Created)
  }

  def apply(strOrName: String): Try[Parsed] = Try {
    import Tile._
    val str = Maps get strOrName getOrElse strOrName
    val heroes = collection.mutable.Map[Int, Pos]()
    val nonEmptyLines = str.lines.filter(_.nonEmpty).toList
    val width = (nonEmptyLines.foldLeft(0) {
      case (len, line) => if (line.size > len) line.size else len
    }) / 2
    val allLines = nonEmptyLines ::: List.fill(width - nonEmptyLines.size)("")
    val filledLines = (allLines map { l =>
      l + " " * (width * 2 - l.size)
    })
    val tiles = filledLines.zipWithIndex map {
      case (line, i) => {
        ((line grouped 2 map (_.toList)).zipWithIndex map {
          case (List(' ', ' '), _) ⇒ Air
          case (List('#', '#'), _) ⇒ Wall
          case (List('[', ']'), _) ⇒ Tavern
          case (List('$', x), _)   ⇒ Mine(int(x))
          case (List('@', x), j) ⇒ {
            val id = int(x) getOrElse (sys error "Wrong hero ID")
            heroes += (id -> Pos(i, j))
            Air
          }
          case (list, j) ⇒ sys error s"""Can't parse "${list.mkString}" in line $i, pos $j: $line"""
        }).toList
      }
    }
    (tiles.toList, heroes.toMap.toList.sortBy(_._1).map(_._2)) match {
      case (tiles, List(h1, h2, h3, h4)) => Parsed(
        board = Board(tiles.map(_.toVector).toVector),
        h1, h2, h3, h4)
      case _ => throw MapParseException(str)
    }
  }

  private def int(c: Char): Option[Int] = Try(java.lang.Integer.parseInt(c.toString)).toOption
}
