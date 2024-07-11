package utils

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.model.headers.RawHeader
import org.apache.pekko.http.scaladsl.unmarshalling.Unmarshal
import io.circe.Json
import scala.concurrent.duration.DurationInt
import utils.pekkohttpcirce.FailFastCirceSupport._

import scala.concurrent.{Await, Future}

class HttpClientForMsg(using actorSystem: ActorSystem) extends ClassLogging {
  private val http = Http()

  private def awaitBlocking[T](f: Future[T], timeSeconds: Int = 5): T = Await.result(f, timeSeconds.seconds)

  def get(uri: String, token: String): Either[StatusCode, Json] = {
    val headers  = List(RawHeader("Authorization", token))
    val response = awaitBlocking(http.singleRequest(HttpRequest(HttpMethods.GET, uri, headers)))
    println(s"testttttttttttt$response")
    try
      if (response.status.isSuccess()) Right(awaitBlocking(Unmarshal(response).to[Json]))
      else Left(response.status)
    catch {
      case exception: Exception =>
        log.error(s"GET($token) $uri failed:", exception)
        Left(StatusCodes.InternalServerError)
    }
  }
}
