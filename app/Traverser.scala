package org.vindinium.server

object Traverser {

  def apply(board: Board, from: Pos): Seq[Pos] = {

    @annotation.tailrec
    def traverseTR(toVisit: Seq[Pos], visited: Set[Pos], accumulator: Seq[Pos]): Seq[Pos] = {
      if (toVisit.isEmpty) accumulator
      else {
        val next = toVisit.head // unsafe, but required for tailrec :-/
        val succ = (walkableFrom(next) -- visited -- toVisit).toSeq
        // DFS :
        //traverseTR(succ ++ toVisit.tail, visited + next, accumulator :+ next)
        // BFS :
        traverseTR(toVisit.tail ++ succ, visited + next, accumulator :+ next)
      }
    }

    def walkableFrom(pos: Pos) = pos.neighbors filter { p =>
      (board get p) == Some(Tile.Air)
    }

    traverseTR(Seq(from), Set.empty, Seq.empty)
  }
}
