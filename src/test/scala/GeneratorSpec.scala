package org.jousse.bot

import org.specs2.mutable._

class GeneratorSpec extends Specification {

  "The generator" should {
    "generate, doh!" in {
      Generator(40).pp must beSuccessfulTry
    }

  }
}
