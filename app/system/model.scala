package org.jousse.bot
package system

import play.api.libs.json.JsValue

case class Pov(gameId: String, token: String)

case class PlayerInput(game: Game, token: String) {

  def hero = game.heroes find (_.token == token)
}

case class Replay(id: String, games: List[JsValue]) {

  def finished: Boolean = games.lastOption.fold(false) { game =>
    (game \ "finished").as[Boolean]
  }

}
