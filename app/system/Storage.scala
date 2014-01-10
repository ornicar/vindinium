package org.jousse.bot
package system

import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import play.api.libs.json._
import play.api.Play.current
import reactivemongo.bson._
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

final class Storage extends Actor with ActorLogging {

  import Storage._

  val db = play.modules.reactivemongo.ReactiveMongoPlugin.db
  val coll = db("replay")

  context.system.eventStream.subscribe(self, classOf[Game])

  def receive = {

    case game: Game => self ! Save(game)

    case Save(game) => coll.update(
      BSONDocument("_id" -> game.id),
      BSONDocument("$push" -> BSONDocument(
        "games" -> (Json stringify JsonFormat(game))
      )),
      upsert = true)

    case Get(id) => coll.find(BSONDocument("_id" -> id)).one[BSONDocument] map { doc =>
      doc flatMap {
        _.getAs[List[String]]("games") map { strs =>
          Replay(id, strs.map(s => Json.parse(s).as[JsObject]))
        }
      }
    } pipeTo sender

    case Init =>
  }
}

object Storage {

  private implicit val timeout = Timeout(1.second)

  def get(id: String): Future[Option[Replay]] = actor ? Get(id) mapTo manifest[Option[Replay]]

  case class Save(game: Game)
  case class Get(id: String)
  case object Init

  import play.api.libs.concurrent.Akka
  val actor = Akka.system.actorOf(Props[Storage], name = "storage")
}
