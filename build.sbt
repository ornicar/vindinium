name := "24hCodeBot"

libraryDependencies ++= Seq(
  "org.specs2" %% "specs2" % "2.3.6" % "test",
  "org.gnieh" %% "tiscaf" % "0.8")

scalacOptions ++= Seq("-feature", "-unchecked", "-deprecation")
