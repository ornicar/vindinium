package org.jousse.bot
package system

trait CustomLogging {

  object log {

    def info = apply("info   ") _
    def warning = apply("warning") _
    def error = apply("error  ") _

    def apply(sev: String)(msg: Any) {
      println(s"$sev $msg")
    }
  }
}
