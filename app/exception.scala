package org.jousse
package bot

trait GameException extends Exception {
  val message: String
  override def getMessage: String = "Vindinium['" + message + "']"
}

case class GeneratorException(message: String) extends GameException

case class NotFoundException(message: String) extends GameException

case class UserNotFoundException(message: String) extends GameException

case class RuleViolationException(message: String) extends GameException

case class GameFinishedException(reason: Status.Finish) extends GameException {
  val message = reason.toString
}

case class MapParseException(message: String) extends GameException

case class UtterFailException(message: String) extends GameException
