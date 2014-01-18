package org.jousse.bot
package system

import org.joda.time.DateTime
import play.api.Play.current
import reactivemongo.bson._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

case class User(
    _id: String,
    name: String,
    key: String,
    createdAt: DateTime,
    elo: Int) {

  def id = _id
}

object User {

  import Storage.BSONJodaDateTimeHandler
  private implicit val handler = reactivemongo.bson.Macros.handler[User]

  def make(name: String): Future[User] = {
    val user = User(
      _id = RandomString(8),
      name = name,
      key = RandomString(8),
      createdAt = DateTime.now,
      elo = 1200)
    coll.insert(user) map { _ => user }
  }

  def find(id: String): Future[Option[User]] =
    coll.find(BSONDocument("_id" -> id)).one[User]

  def all: Future[List[User]] =
    coll.find(BSONDocument()).sort(BSONDocument("elo" -> -1)).cursor[User].collect[List]()

  private val db = play.modules.reactivemongo.ReactiveMongoPlugin.db
  private val coll = db("user")
}
