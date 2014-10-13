lazy val vindinium = (project in file(".")).enablePlugins(PlayScala)

name := "vindinium"

version := "1.1"

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  "org.reactivemongo" %% "reactivemongo" % "0.10.5.0.akka23",
  "org.reactivemongo" %% "play2-reactivemongo" % "0.10.5.0.akka23",
  "joda-time" % "joda-time" % "2.3")

resolvers ++= Seq(
  "sonatype snapshots" at "https://oss.sonatype.org/content/repositories/snapshots")

scalacOptions ++= Seq("-feature", "-language:_", "-unchecked", "-deprecation")

TwirlKeys.templateImports in Compile ++= Seq(
  "org.vindinium.server.{ Game, Board, Hero, JsonFormat }",
  "org.vindinium.server.system.Replay",
  "org.vindinium.server.user.User")

sources in doc in Compile := List()
