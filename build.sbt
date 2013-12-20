lazy val hello = taskKey[Unit]("An example task")

hello := { println("Hello!") }

name := "24hCodeBot"

libraryDependencies += "org.specs2" %% "specs2" % "2.3.6" % "test"
