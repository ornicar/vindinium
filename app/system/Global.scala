package org.jousse.bot
package system

import play.api.mvc._
import play.api.{ Application, GlobalSettings, Mode }
import scala.concurrent.Future

object Global extends GlobalSettings {

  override def onStart(app: Application) {
    Storage.actor ! Storage.Init
    Elo.actor ! Elo.Init
    Visualization.actor ! Visualization.Init
  }

  override def onHandlerNotFound(req: RequestHeader) = {
    println(req)
    Future successful notFoundPage
  }
}
