package org.vindinium.server
package system

import org.joda.time.DateTime

import reactivemongo.bson._
import reactivemongo.bson.Macros

object BSONHandlers {

  import reactivemongo.bson.{ BSONHandler, BSONDateTime }
  implicit object BSONJodaDateTimeHandler extends BSONHandler[BSONDateTime, DateTime] {
    def read(x: BSONDateTime) = new DateTime(x.value)
    def write(x: DateTime) = BSONDateTime(x.getMillis)
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

  private val dirMap: Map[Dir, Int] =
    Map(Dir.Stay -> 0, Dir.North -> 1, Dir.South -> 2, Dir.East -> 3, Dir.West -> 4, Dir.Crash -> 99)

  private lazy val reverseDirMap = dirMap.map(x => x._2 -> x._1).toMap

  implicit val dirHandler = new BSONHandler[BSONInteger, Dir] {
    def read(int: BSONInteger) = reverseDirMap get int.value getOrElse Dir.Stay
    def write(x: Dir) = BSONInteger(dirMap get x getOrElse 0)
  }

  implicit val boardHandler = new BSONHandler[BSONString, Board] {
    def read(str: BSONString) = Board((str.value grouped 2).toVector map Tile.read)
    def write(x: Board) = BSONString(x.tiles.map(_.render).mkString)
  }

  implicit val posHandler = Macros.handler[Pos]
  implicit val heroHandler = Macros.handler[Hero]
  implicit val gameHandler = Macros.handler[Game]
  implicit val replayHandler = Macros.handler[Replay]
}
