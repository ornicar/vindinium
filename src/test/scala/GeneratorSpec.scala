package jousse.org.bot

import org.specs2.mutable._

class GeneratorSpec extends Specification {

  "The generator" should {
    "generate, doh!" in {
      Generator(20).pp must beSuccessfulTry
    }

  }
}
