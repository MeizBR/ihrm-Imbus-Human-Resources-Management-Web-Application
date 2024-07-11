package utils

object Tokens {
  private val tokenChars  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  private val tokenLength = 16
  def generate(): String  =
    Seq.fill(tokenLength)(tokenChars(scala.util.Random.nextInt(tokenChars.length))).mkString
}
