package org.vindinium.server

object RandomString {

  def apply(len: Int) = List.fill(len)(nextChar) mkString

  private val chars: IndexedSeq[Char] = (('0' to '9') ++ ('a' to 'z'))
  private val nbChars = chars.size
  private def nextChar = chars(scala.util.Random nextInt nbChars)
}
