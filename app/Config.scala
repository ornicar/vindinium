package org.jousse
package bot

import scala.util.Random

case class Config(
  goldToWin: Int,
  maxTurns: Int,
  size: Int,
  wallPercent: Int,
  minePercent: Int)

object Config {

  val default = Config(
  goldToWin = 1000,
  maxTurns = 1200,
  size = 30,
  wallPercent = 40,
  minePercent = 4)

  def random = Config.default.copy(
    size = 10 + ((Random nextInt 15) * 2),
    wallPercent = 15 + (Random nextInt 28),
    minePercent = 1 + (Random nextInt 8))
}
