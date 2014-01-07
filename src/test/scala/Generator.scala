package jousse.org
package bot

import scala.util.{ Try, Success, Failure }

object Generator {

  def apply(size: Int): Try[Board] = size match {
    case s if s < 8      ⇒ Failure(new Exception("Board is too small"))
    case s if s % 2 != 0 ⇒ Failure(new Exception("Board size is odd"))
    case s               ⇒ Success(doApply(size / 2))
  }

  private def doApply(halfSize: Int): Board = Board(Vector(Vector()))

}
