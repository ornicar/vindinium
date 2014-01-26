package org.vindinium.server
package system

import play.api.mvc._
import play.api.{ Application, GlobalSettings, Mode }
import scala.concurrent.Future

object Global extends GlobalSettings {

  override def onStart(app: Application) {
    Elo.actor ! Elo.Init
    Visualization.actor ! Visualization.Init
  }

  override def onHandlerNotFound(req: RequestHeader) = {
    println(req)
    Future successful notFoundPage
  }
}
