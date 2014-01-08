name := "24hCodeBot"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  "org.specs2" %% "specs2" % "2.3.6" % "test")

scalacOptions ++= Seq("-feature", "-language:_", "-unchecked", "-deprecation")

play.Project.playScalaSettings

play.Project.templatesImport ++= Seq(
  "org.jousse.bot._")
