package org.jousse.bot

import org.specs2.mutable._

class GeneratorSpec extends Specification {

  "The generator" should {
    "generate, doh!" in {
      val wallP = scala.util.Random.nextInt(30) + 13
      Generator(
        size = 30,
        wallPercent = wallP,
        beerPercent = 2,
        minePercent = 3) must beSuccessfulTry.like {
          case game => {
            println(game)
            success
          }
        }
    }

  }
}
