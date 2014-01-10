package org.jousse
package bot

trait GameException extends Exception {
  val message: String
  override def getMessage: String = "Game['" + message + "']"
}

case class RuleViolationException(message: String) extends GameException

case class GameFinishedException(reason: Status.Finish) extends GameException {
  val message = reason.toString
}
