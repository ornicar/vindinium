package org.jousse.bot

import org.specs2.mutable._
import scala.util.{ Try, Success, Failure }

class MoverSpec extends Specification {


  val board = Board(Vector(
    Vector(Tile.Air, Tile.Wall, Tile.Air, Tile.Air),
    Vector(Tile.Monster, Tile.Hero(1), Tile.Hero(2), Tile.Air),
    Vector(Tile.Air, Tile.Potion, Tile.Air, Tile.Air)
  ))

  "The mover" should {

    "not allow non hero tiles to be moved" in {
      Mover(board, Pos(0,1), Pos(0,2)) must beFailedTry.withThrowable[Exception]("You can only move heroes")
    }

    "not allow a move to a non neighbor tile" in {
      Mover(board, Pos(1,1), Pos(2,2)) must beFailedTry.withThrowable[Exception]("You can only move to a neighbor tile")
    }

    "not allow a move to a wall" in {
      Mover(board, Pos(1,1), Pos(0,1)) must beFailedTry.withThrowable[Exception]("You can't move to a wall")
    }

    "not allow a move to another Hero" in {
      Mover(board, Pos(1,1), Pos(1,2)) must beFailedTry.withThrowable[Exception]("You can't move to another Hero")
    }

    "allow a move to a potion tile" in {
      Mover(board, Pos(1,1), Pos(2,1)) must beSuccessfulTry
    }
  }

}
