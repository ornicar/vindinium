package org.jousse.bot

import play.api.data._
import play.api.data.Forms._

object form {

  case class Training(
      key: String,
      turns: Option[Int],
      map: Option[String]) {

    def config = {
      val c = map.fold(Config.random)(Config.stringMap)
      turns.fold(c)(t => c.copy(turns = t * 4))
    }
  }

  val training = Form(mapping(
    "key" -> nonEmptyText,
    "turns" -> optional(number),
    "map" -> optional(text)
  )(Training.apply)(Training.unapply))

  val move = Form(single("dir" -> nonEmptyText))
}
