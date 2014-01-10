package org.jousse.bot

package object system {

  def notFound(msg: String) = akka.actor.Status.Failure(NotFoundException(msg))
}
