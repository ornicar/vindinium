package org.jousse
package bot

import scala.util.{ Try, Success, Failure }

object Validator {

  def board(b: Board): Try[Board] = {

    val accessible = Traverser(b, b.topLeft).toSet

    if (accessible(b.topRight) &&
      accessible(b.bottomLeft) &&
      accessible(b.bottomRight)) Success(b)
    else Failure(new Exception("The players can't reach each other"))
  }

  def game(g: Game): Boolean =   
    Traverser(g.board, g.hero1.pos) contains g.hero2.pos
}
