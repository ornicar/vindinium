package org.jousse
package bot

import scala.util.Random

case class Config(
    map: Config.Map,
    turns: Int,
    training: Boolean) {

  def make = map match {
    case m: Config.GenMap      => Generator(m, turns, training)
    case Config.StringMap(str) => StringMapParser(str) map (_ game turns)
  }
}

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
      size = 10 + ((Random nextInt 10) * 2),
      wallPercent = 10 + (Random nextInt 32),
      minePercent = 3 + (Random nextInt 7))
  )

  def arena = random.copy(
    training = false,
    turns = 300 * 4
  )
}
