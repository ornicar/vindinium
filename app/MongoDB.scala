package org.jousse.bot

import org.joda.time.DateTime
import reactivemongo.bson.{ BSONHandler, BSONDateTime }

object MongoDB {

  implicit object BSONJodaDateTimeHandler extends BSONHandler[BSONDateTime, DateTime] {
    def read(x: BSONDateTime) = new DateTime(x.value)
    def write(x: DateTime) = BSONDateTime(x.getMillis)
  }
}
