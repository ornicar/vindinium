package org.jousse
package bot

import scala.util.{ Try, Success, Failure }

object Validator {

  def heroPos(b: Board, pos: Pos): Boolean = (b isAir pos) && {
    val traverse = Traverser(b, pos)
    (traverse contains b.mirrorX(pos)) &&
      (traverse contains b.mirrorY(pos))
  }

  def heroPos(g: Game, pos: Pos): Boolean =
    (g hero pos).isEmpty && heroPos(g.board, pos)
}
