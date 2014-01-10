package org.jousse.bot

import org.specs2.mutable._

class GeneratorSpec extends Specification {

  "The generator" should {
    "generate, doh!" in {
      val wallP = scala.util.Random.nextInt(30) + 13
      Generator(Config.random) must beSuccessfulTry.like {
          case game => {
            println(game.render)
            success
          }
        }
    }

  }
}
