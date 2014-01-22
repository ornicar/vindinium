package org.jousse.bot
package system

import MongoDB._
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.Play.current
import reactivemongo.bson._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

case class Replay(
    _id: String,
    training: Boolean,
    names: List[String],
    games: List[String],
    finished: Boolean) {

  def id = _id
}

object Replay {

  // implicit val jsValueReader = new BSONReader[BSONString, JsValue] {
  //   def read(string: BSONString) = Json parse string.value
  // }
  private implicit val reader = reactivemongo.bson.Macros.reader[Replay]

  def find(id: String): Future[Option[Replay]] =
    coll.find(BSONDocument("_id" -> id)).one[Replay]

  def recent(nb: Int): Future[List[Replay]] =
    coll.find(BSONDocument("training" -> false))
      .sort(BSONDocument("date" -> -1))
      .cursor[Replay].collect[List](nb)

  def recentByUserName(name: String, nb: Int): Future[List[Replay]] =
    coll.find(BSONDocument("training" -> false, "names" -> name))
      .sort(BSONDocument("date" -> -1))
      .cursor[Replay].collect[List](nb)

  def add(game: Game) = coll.update(
    BSONDocument("_id" -> game.id),
    BSONDocument(
      "$push" -> BSONDocument(
        "games" -> (Json stringify JsonFormat(game))
      )
    ) ++ {
        if (game.turn == 0) BSONDocument(
          "$set" -> BSONDocument(
            "training" -> game.training,
            "names" -> game.names,
            "date" -> DateTime.now,
            "finished" -> false
          )
        )
        else if (game.finished) BSONDocument("$set" -> BSONDocument("finished" -> true)) else BSONDocument()
      },
    upsert = true)

  private val db = play.modules.reactivemongo.ReactiveMongoPlugin.db
  private val coll = db("replay")
}
