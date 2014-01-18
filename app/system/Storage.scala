package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import MongoDB._
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.Play.current
import reactivemongo.bson._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import reactivemongo.api.collections.default.BSONCollection
import scala.concurrent.Future

final class Storage(coll: BSONCollection) extends Actor with ActorLogging {

  import Storage._

  context.system.eventStream.subscribe(self, classOf[Game])

  def receive = {

    case game: Game => self ! Save(game)

    case Save(game) => coll.update(
      BSONDocument("_id" -> game.id),
      BSONDocument(
        "$push" -> BSONDocument(
          "games" -> (Json stringify JsonFormat(game))
        ),
        "$set" -> BSONDocument(
          "playedAt" -> DateTime.now
        )
      ),
      upsert = true)

    case Init =>
  }
}

object Storage {

  private val db = play.modules.reactivemongo.ReactiveMongoPlugin.db
  private val coll = db("replay")

  def get(id: String): Future[Option[Replay]] =
    coll.find(BSONDocument("_id" -> id)).one[BSONDocument] map { doc =>
      doc flatMap {
        _.getAs[List[String]]("games") map { strs =>
          Replay(id, strs.map(s => Json.parse(s).as[JsObject]))
        }
      }
    }

  case class Save(game: Game)
  case object Init

  import play.api.libs.concurrent.Akka
  val actor = Akka.system.actorOf(Props(new Storage(coll)), name = "storage")
}
