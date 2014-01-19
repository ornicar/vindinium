package org.jousse.bot
package system

case class Pov(gameId: String, token: String)

case class PlayerInput(game: Game, token: String) {

  def hero = game.heroes find (_.token == token)
}

case class AiTimeoutException(pov: Pov) extends GameException {
  def message = s"$pov timeout"
}
