package org.jousse
package bot

import controllers.routes
import play.api.libs.json._
import system.Replay

object JsonFormat {

  def apply(i: system.PlayerInput, domain: String): JsObject = Json.obj(
    "game" -> apply(i.game),
    "hero" -> i.hero.map(apply),
    "token" -> i.token,
    "playUrl" -> (domain + routes.Api.move(i.game.id, i.token, "dir").url)
  )

  def apply(g: Game): JsObject = Json.obj(
    "id" -> g.id,
    "turn" -> g.turn,
    "heroes" -> JsArray(g.heroes map apply),
    "board" -> Json.obj(
      "size" -> g.board.size,
      "tiles" -> (g.board.posTiles map {
        case (pos, tile) => (g hero pos).fold(tile.render)(_.render)
      }).mkString
    )
  )

  def apply(h: Hero): JsObject = Json.obj(
    "id" -> h.id,
    "name" -> h.name,
    "pos" -> List(h.pos.x, h.pos.y),
    "life" -> h.life,
    "gold" -> h.gold,
    "crashed" -> h.crashed)

  def apply(r: Replay): JsObject = Json.obj(
    "id" -> r.id,
    "games" -> JsArray(r.games)
  )
}
