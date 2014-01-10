package org.jousse.bot
package system

import play.api.libs.json.JsObject

case class Pov(gameId: String, token: String)

case class PlayerInput(game: Game, token: String) {

  def hero = game.heroes find (_.token == token)
}

case class Replay(id: String, games: List[JsObject])
