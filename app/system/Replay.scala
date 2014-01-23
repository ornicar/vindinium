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
    init: Game,
    moves: List[Dir],
    training: Boolean,
    names: List[String],
    finished: Boolean,
    date: DateTime) {

  def games: List[Game] = (moves.foldLeft(List(init)) {
    case (Nil, _)                => Nil
    case (all@(game :: _), move) => Arbiter.replay(game, move) :: all
  }).reverse

  def id = _id
}

object Replay {

  import BSONHandlers._

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

  def add(id: String, dir: Dir) = coll.update(
    BSONDocument("_id" -> id),
    BSONDocument("$push" -> BSONDocument("moves" -> dir))
  )

  def insert(game: Game) = coll.insert(Replay(
    _id = game.id,
    init = game,
    moves = Nil,
    training = game.training,
    names = game.names,
    finished = game.finished,
    date = DateTime.now))

  private val db = play.modules.reactivemongo.ReactiveMongoPlugin.db
  private val coll = db("replay")
}
