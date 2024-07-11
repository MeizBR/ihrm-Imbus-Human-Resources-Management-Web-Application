package utils

import java.io.File
import java.util.UUID

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.marshalling.Marshal
import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.model.headers.RawHeader
import com.typesafe.config.ConfigFactory
import db.Databases
import utils.pekkohttpcirce.FailFastCirceSupport._
import ihrm.Server
import ihrm.Server.db
import io.circe.parser.decode
import io.circe.syntax._
import io.circe.{Decoder, Encoder}
import utils.HttpClient.Result
import utils.RestErrorFactory.Failure
import org.slf4j.LoggerFactory
import scala.concurrent.ExecutionContext.Implicits.{global => ec}
import scala.concurrent.duration.{DurationInt, FiniteDuration}
import scala.concurrent.{Await, Future}
import utils.pekkohttpcirce.FailFastCirceSupport._

object HttpClient {
  type Result[T] = Either[(StatusCode, Failure), T]

  extension [T](result: Result[T])
    def get: T = result match {
      case Right(r) => r
      case Left(f)  => throw new IllegalStateException(s"Unexpected failure: $f")
    }
}

trait HttpClient extends ClassLogging {

  protected def resetDataBase: Boolean           = true
  protected def prepareData(db: Databases): Unit = {}
  given actorSystem: ActorSystem                 = ActorSystem(getClass.getName.replaceAll("\\W", "-"))
  given requestTimeout: FiniteDuration           = 5000.millis
  private val http                               = Http()
  lazy val busForMsg                             = new MessagingBus()
  lazy val httpClientForMsg                      = new utils.HttpClientForMsg()

  def preparedServer: Thread =
    new Thread(() =>
      try {
        Server.resetCountDownLatches()
        Server.devMode = true
        val conf = ConfigFactory.load("test.conf")
        Server.db.initDb
        prepareData(Server.db)
        // Directly use `log` here
        log.info("...... Entering Test Mode ....")
        Server.withConnections(conf, Server.db)
      } catch {
        case e: Throwable =>
          // Directly use `log` here as well
          log.error("Preparing service failed.", e)
      } finally {
        // And here
        log.info("...... Start to stop the server ....")
        Server.isRunning.countDown()
        actorSystem
          .terminate()
          .onComplete { r =>
            log.info(s"Actor system stopped: $r")
          }(scala.concurrent.ExecutionContext.Implicits.global)
      }
    ).tap(_.start())

  protected def response[T: Encoder](
      method: HttpMethod,
      uri: String,
      body: T,
      token: Option[String]
  ): Future[HttpResponse] =
    request(method, uri, body, token).flatMap(http.singleRequest(_))

  protected def response(method: HttpMethod, uri: String, token: Option[String]): Future[HttpResponse] =
    request(method, uri, None, token).flatMap(http.singleRequest(_))

  private def request[T: Encoder](
      method: HttpMethod,
      uri: String,
      body: T,
      token: Option[String]
  ): Future[HttpRequest] =
    Marshal(body.asJson).to[RequestEntity].map { entity =>
      log.info(s" $method -- $body")
      val headers = token.map(RawHeader("Authorization", _)).toList
      HttpRequest(method, uri, headers, entity)
    }

  protected def qParams(discardEmptyValues: Boolean, params: (String, Option[Any])*): String =
    if (params.isEmpty) ""
    else
      params
        .filterNot(discardEmptyValues && _._2.isEmpty)
        .map {
          case (name, Some(t: Iterable[_])) => s"$name=${t.mkString(",")}"
          case (name, maybeValue)           => s"$name${maybeValue.fold("")(v => s"=$v")}"
        }
        .mkString("?", "&", "")

  def healthCheckRequest(method: HttpMethod, uri: String): Future[HttpResponse] =
    http.singleRequest(HttpRequest(method, uri))

  protected def shutdown(): Unit =
    http.shutdownAllConnectionPools()

  protected def randomName: String = UUID.randomUUID().toString.take(8)

  extension (response: Future[HttpResponse])
    def raw(using timeout: FiniteDuration): Result[String] =
      Await.result(response, timeout).pipe { r =>
        if (r.status.isSuccess()) {
          Await.result(r.entity.toStrict(timeout).map(e => Right(e.data.utf8String)), timeout)
        } else {
          Await.result(
            r.entity.toStrict(timeout).map { e =>
              Left(
                (
                  r.status,
                  decode[Failure](e.data.utf8String) match {
                    case Right(failure) => failure
                    case Left(error)    => Failure(s"Unexpected error: ${error.getMessage}")
                  }
                )
              )
            },
            timeout
          )
        }
      }

    def decoded[T](implicit timeout: FiniteDuration, decoder: Decoder[T]): Result[T] =
      raw(using timeout).map { s =>
        decode[T](s) match {
          case Right(value) => value
          case Left(error)  => throw new IllegalStateException(s"Decoding failure: $error")
        }
      }
}
