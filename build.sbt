name := "vindinium"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  "org.specs2" %% "specs2" % "2.3.6" % "test",
  "org.reactivemongo" %% "reactivemongo" % "0.10.0",
  "org.reactivemongo" %% "play2-reactivemongo" % "0.10.2",
  "joda-time" % "joda-time" % "2.3",
  "org.joda" % "joda-convert" % "1.2")

scalacOptions ++= Seq("-feature", "-language:_", "-unchecked", "-deprecation")

play.Project.playScalaSettings

play.Project.templatesImport ++= Seq(
  "org.jousse.bot.{ Game, Board, Hero, JsonFormat }",
  "org.jousse.bot.system.Replay",
  "org.jousse.bot.user.User")


sources in doc in Compile := List()
