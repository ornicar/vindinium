package org.jousse
package bot

import scala.util.Random

case class Config(
  map: Config.Map,
  turns: Int,
  training: Boolean)

object Config {

  sealed trait Map
  case class StringMap(str: String) extends Map
  case class GenMap(
    size: Int,
    wallPercent: Int,
    minePercent: Int) extends Map

  def stringMap(str: String) = default.copy(map = StringMap(str))

  val default = Config(
    map = GenMap(
      size = 30,
      wallPercent = 40,
      minePercent = 4),
    turns = 300 * 4,
    training = true)

  def random = Config.default.copy(
    map = GenMap(
      size = 8 + ((Random nextInt 8) * 2),
      wallPercent = 15 + (Random nextInt 28),
      minePercent = 2 + (Random nextInt 6))
  )

  def arena = random.copy(
    training = false,
    turns = 300 * 4
  )
}
