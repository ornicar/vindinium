package org.jousse.bot
package user

import MongoDB._
import org.joda.time.DateTime
import play.api.Play.current
import reactivemongo.bson._
import reactivemongo.core.commands.Count
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

  def blame(hero: Hero) = hero.copy(
    name = name,
    userId = Some(id),
    elo = Some(elo)
  )
}

object User {

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

  def findByKey(key: String): Future[Option[User]] =
    coll.find(BSONDocument("key" -> key)).one[User]

  def top(nb: Int): Future[List[User]] =
    coll.find(BSONDocument())
      .sort(BSONDocument("elo" -> -1))
      .cursor[User].collect[List](nb)

  def freeName(name: String): Future[Boolean] =
    db command Count(coll.name, Some(BSONDocument("name" -> name))) map (1>)

  def findByNames(names: List[String]): Future[List[User]] =
    coll.find(BSONDocument("name" -> BSONDocument("$in" -> names))).cursor[User].collect[List]() 

  private val db = play.modules.reactivemongo.ReactiveMongoPlugin.db
  private val coll = db("user")
}
