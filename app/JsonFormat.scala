package org.jousse
package bot

import play.api.libs.json._

object JsonFormat {

  def apply(g: Game): JsObject = Json.obj(
    "id" -> g.id,
    "turn" -> g.turn,
    "heroes" -> JsArray(g.heroes map { h =>
      Json.obj(
        "id" -> h.id,
        "name" -> h.name,
        "pos" -> List(h.pos.x, h.pos.y),
        "life" -> h.life,
        "gold" -> h.gold
      )
    }),
    "board" -> Json.obj(
      "size" -> g.board.size,
      "tiles" -> JsArray(g.board.posTiles map {
        case (pos, tile) => JsString((g hero pos).fold(tile.render)(_.render))
      })
    )
  )
}
