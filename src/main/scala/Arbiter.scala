package jousse.org
package bot

import scala.util.{ Try, Success, Failure }

object Arbiter {

  def move(game: Game, number: Int, dir: Dir): Try[Game] =
    if (game.player.number != number)
      Failure(new Exception(s"Not player $number turn to move"))
    else Success(game)
}
