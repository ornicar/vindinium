package org.jousse.bot
package system

import scala.util.Try
import reactivemongo.bson._
import reactivemongo.bson.Macros

object BSONHandlers {

  implicit val tileHandler = new BSONHandler[BSONString, Tile] {
    def read(str: BSONString) = str.value.toList match {
      case List(' ', ' ') ⇒ Tile.Air
      case List('#', '#') ⇒ Tile.Wall
      case List('[', ']') ⇒ Tile.Tavern
      case List('$', x)   ⇒ Tile.Mine(int(x))
      case x              ⇒ sys error s"Can't parse tile $str"
    }
    def write(x: Tile) = BSONString(x.render)
  }

  implicit val statusHandler = new BSONHandler[BSONString, Status] {
    def read(str: BSONString) = str.value match {
      case "Created"    ⇒ Status.Created
      case "Started"    ⇒ Status.Started
      case "AllCrashed" ⇒ Status.AllCrashed
      case "TurnMax"    ⇒ Status.TurnMax
      case x            ⇒ sys error s"Can't parse status $str"
    }
    def write(x: Status) = BSONString(x.toString)
  }

  implicit val dirHandler = new BSONHandler[BSONString, Dir] {
    def read(str: BSONString) = Dir(str.value)
    def write(x: Dir) = BSONString(x.toString)
  }

  implicit val posHandler = Macros.handler[Pos]
  implicit val heroHandler = Macros.handler[Hero]
  implicit val boardHandler = Macros.handler[Board]
  implicit val gameHandler = Macros.handler[Game]
  implicit val replayHandler = Macros.handler[Replay]

  private def int(c: Char): Option[Int] = Try(java.lang.Integer.parseInt(c.toString)).toOption
}
