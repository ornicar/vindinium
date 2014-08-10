package org.vindinium.server
package system

object RandomMap {

  private var replay: Option[Replay] = None

  def apply() = {
    replay = Config.arena.make.map(Replay.make).toOption.map(_.copy(moves = List(Dir.Stay)))
    replay
  }

  def get(id: String) = replay filter (_.id == id)
}
