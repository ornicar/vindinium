package org.jousse.bot
package system

import play.api.mvc._
import play.api.{ Application, GlobalSettings, Mode }

object Global extends GlobalSettings {

  override def onStart(app: Application) {
    Storage.actor ! Storage.Init
  }
}
