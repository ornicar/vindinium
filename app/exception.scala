package org.vindinium.server

trait GameException extends Exception {
  def message: String
  override def getMessage: String = s"Vindinium - $message"
}

case class GeneratorException(message: String) extends GameException

case class NotFoundException(message: String) extends GameException

case class UserNotFoundException(message: String) extends GameException

case class RuleViolationException(message: String) extends GameException

case class TimeoutException(message: String) extends GameException

case class GameFinishedException(reason: Status.Finish) extends GameException {
  def message = reason.toString
}

case class MapParseException(message: String) extends GameException

case class UtterFailException(message: String) extends GameException
