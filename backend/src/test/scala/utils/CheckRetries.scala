package utils

import scala.annotation.tailrec
import scala.concurrent.duration._
import scala.util.Try

import org.specs2.SpecificationLike
import org.specs2.matcher.{MatchResult, MatchSuccess, NeverMatcher}

trait CheckRetries { this: SpecificationLike =>
  private val retryCount = 10
  private val retryWait  = 300.millis

  def eventually[T](check: => MatchResult[T]): MatchResult[T] = eventually(retryCount, retryWait, check)

  def eventually[T](count: Int, delay: FiniteDuration, check: => MatchResult[T]): MatchResult[T] = {
    @tailrec
    def retryCheck(n: Int): MatchResult[T] =
      Try(check) match {
        case scala.util.Success(r: MatchSuccess[_] with T @unchecked) => r
        case scala.util.Success(failure)                              =>
          if (n > 0) {
            Thread.sleep(delay.toMillis)
            retryCheck(n - 1)
          } else failure
        case scala.util.Failure(ex: Throwable)                        =>
          if (n > 0) {
            Thread.sleep(delay.toMillis)
            retryCheck(n - 1)
          } else {
            // To avoid failing with an exception we create a failed MatcherResult passing the error message
            // taken from the original exception
            // format: off
            NeverMatcher
              .apply()
              .setMessage(s"Last retry failed with: ${ex.getMessage}")
              .asInstanceOf[MatchResult[T]]
            
            // format: on
          }
      }

    retryCheck(count)
  }

  def preconditioned[T](pecondition: => Boolean)(check: => MatchResult[T]): MatchResult[T] = eventually(
    pecondition === true
  ) match {
    case _: MatchSuccess[_] => check
    case _                  => NeverMatcher.apply().setMessage("Precondition not met").asInstanceOf[MatchResult[T]]
  }
}
