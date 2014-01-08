package org.jousse
package bot
package http

import scala.util.{ Try, Success, Failure }
import tiscaf._

object BotServer extends HServer with App {

  def port = args.toIndexedSeq lift 0 flatMap { p ⇒
    Try(p.toInt).toOption
  } getOrElse 9874

  val apps = Seq(ServerApp, StaticApp)
  val ports = Set(port)
  override protected val name = "bot-server"
  override protected val maxPostDataLength = 1024 * 1024
  // do not start the stop thread
  override protected def startStopListener {}

  start
  println("press enter to stop...")
  Console.readLine
  stop
}

/** The application that serves the pages */
object ServerApp extends HApp {

  override def keepAlive = true
  override def gzip = false
  override def chunked = false
  override def tracking = HTracking.NotAllowed

  def resolve(req: HReqData): Option[HLet] = Some(ServerLet) 
}

/** Serves the current server time */
object ServerLet extends HSimpleLet {

  def act(talk: HTalk) {
    def write(str: String, status: HStatus.Value) = {
      val bytes = str getBytes "UTF-8"
      talk
      .setContentType("text/plain; charset=UTF-8")
      .setCharacterEncoding("UTF-8")
      .setContentLength(bytes.size)
      .setStatus(status)
      .write(bytes)
    }
    write("hellow bitch", HStatus.OK)
  }
}

object StaticApp extends HApp {

  override def buffered = true // ResourceLet needs buffered or chunked be set

  def resolve(req: HReqData) = Some(StaticLet) // generates 404 if resource not found
}

object StaticLet extends let.ResourceLet {
  protected def dirRoot = ""
  override protected def uriRoot = ""
  override protected def indexes = List("index.html")
}

