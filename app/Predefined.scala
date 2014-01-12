package org.jousse
package bot

import scala.util.{ Random, Try, Success, Failure }

object Predefined {

  def first: Try[Game] = parse(firstBoard) map {
    case (board, heroes) => Game(
      id = RandomString(8),
      board = board,
      config = Config.random,
      hero1 = Hero(1, "Alaric", heroes(1)),
      hero2 = Hero(2, "Luther", heroes(2)),
      hero3 = Hero(3, "Thorfinn", heroes(3)),
      hero4 = Hero(4, "York", heroes(4)),
      status = Status.Created)
  }

  def parse(str: String): Try[(Board, Map[Int, Pos])] = Try {
    import Tile._
    val heroes = collection.mutable.Map[Int, Pos]()
    val tiles = str.lines.zipWithIndex map {
      case (line, i) => ((line grouped 2 map (_.toList)).zipWithIndex map {
        case (List(' ', ' '), _) ⇒ Air
        case (List('#', '#'), _) ⇒ Wall
        case (List('[', ']'), _) ⇒ Tavern
        case (List('$', x), _)   ⇒ Mine(int(x))
        case (List('@', x), j) ⇒ {
          val id = int(x) getOrElse (sys error "Wrong hero ID")
          heroes += (id -> Pos(i, j))
          Air
        }
        case (_, _) ⇒ sys error s"Can't parse $str"
      }).toList
    }
    Board(tiles.map(_.toVector).toVector) -> heroes.toMap
  }

  val firstBoard = """##@1    ####    @4##
      ########      
        ####        
    []        []    
$-    ##    ##    $-
$-    ##    ##    $-
    []        []    
        ####  @3    
      ########      
##@2    ####      ##"""

  private def int(c: Char): Option[Int] = Try(java.lang.Integer.parseInt(c.toString)).toOption
}
