package wsActor

import org.apache.pekko.actor._
import org.apache.pekko.http.scaladsl.model.ws.TextMessage
import com.typesafe.config.{Config, ConfigFactory}
import controllers.SessionHandler.userSessions
import db.Databases
import io.circe.generic.auto._
import io.circe.parser.decode
import io.circe.syntax.EncoderOps
import io.circe.{Encoder, Json, Printer}
import utils.{HttpClientForMsg, MessagingBus}
import wsActor.NotificationManager._
//import utils.pekkohttpcirce.encodeTypeAndContentOut
import scala.concurrent.ExecutionContextExecutor
import scala.concurrent.duration.DurationInt
import scala.util._
import ihrm.Server._
import utils.pekkohttpcirce._
object WsActor {
  private val conf: Config         = ConfigFactory.load()
  private val interface: String    = conf.getString("http.host")
  private val port: Int            = conf.getInt("http.port")
  private val jsonPrinter: Printer = Printer.noSpaces.copy(dropNullValues = true)
  case class Channel(channel: String)
  case class MessageIn(channel: String, data: TypeAndContentIn)

  case class TypeAndContentIn(messageType: String, content: Json)
  case class MessageOut(channel: String, data: Json)

  case class TypeAndContentOut[T: Encoder](messageType: String, content: T)

  implicit def encodeTypeAndContentOut[T: Encoder]: Encoder[TypeAndContentOut[T]] = Encoder.instance {
    case TypeAndContentOut(messageType, content) =>
      Json.obj(
        "messageType" -> Json.fromString(messageType.toString),
        "content"     -> content.asJson
      )
  }
  case class HttpErrorOut(errorCode: Int, errorMessage: String)

  object Update {
    def apply[T: Encoder](messageType: String, t: T): Json = TypeAndContentOut(messageType, t).asJson
  }

  object GetBody {
    def apply[T: Encoder](t: T): Json = TypeAndContentOut("GetResponseBody", t).asJson
  }
  def jsonString[T: Encoder](data: T): String = jsonPrinter.print(data.asJson)

  object WsActorMessage {
    def apply[T: Encoder](typ: String, data: T): TextMessage =
      TextMessage(jsonString(MessageOut("wsActor", TypeAndContentOut(typ, data).asJson)))
  }

  def apply(bus: MessagingBus, http: HttpClientForMsg, db: Databases): Props =
    Props(new WsActor(bus, http, db)).withDispatcher("async-io-dispatcher")
}
class WsActor(bus: MessagingBus, http: HttpClientForMsg, db: Databases) extends Actor with Stash with ActorLogging {
  import WsActor._
  import context.system

  given dispatcher: ExecutionContextExecutor = system.dispatcher

  log.info(s"Actor started.")
  val activityCheckScheduler = system.scheduler.scheduleWithFixedDelay(
    initialDelay = 5.seconds,
    delay = 5.seconds,
    receiver = self,
    message = NotificationManager
  )

  override def postStop(): Unit = {
    log.info("Actor stopped.")
    activityCheckScheduler.cancel()
  }

  override def receive: Receive = {
    // from WsFlow
    case (ws: ActorRef, workspaceId: Int, token: String) =>
      authorize(ws, workspaceId, token)
    case _                                               => stash()
  }

  private def authorize(wsActor: ActorRef, workspaceId: Int, token: String): Unit =
    userSessions.get((workspaceId, token)) match {
      case Some(_) =>
        unstashAll()
        context.setReceiveTimeout(10.seconds)
        context.become(process(wsActor, workspaceId, token))
      case other   =>
        wsActor ! WsActorMessage("HttpError", HttpErrorOut(401, "Unauthorized"))
        log.warning(s"iHRM.Pekko: Invalid authentication response, terminating: $other")
        scheduleStop()
    }

  private def process(ws: ActorRef, workspaceId: Int, token: String): Receive = {

    // from self
    case ReceiveTimeout           =>
      ws ! TextMessage("heartbeat")

    // from websocket
    case TextMessage.Strict(text) =>
      decode[MessageIn](text) match {

        case Right(MessageIn("management", TypeAndContentIn("SubscribeChannel", content))) =>
          content.as[Channel] match {
            case Right(Channel(channel)) =>
              log.info(s"Messaging: Subscription for $channel established")
              http.get(s"http://$interface:$port/api/$channel", token) match {
                case Right(json)  =>
                  val message = jsonString(MessageOut(channel, GetBody(json)))
                  ws ! TextMessage(message)
                  bus.subscribe(self, channel)
                case Left(status) =>
                  log.info(s"Initial GET response failed: $status")
                  ws ! WsActorMessage("HttpError", HttpErrorOut(status.intValue(), status.value))
              }

            case Left(problem) =>
              log.info(s"Badly formatted SubscribeChannel command: $text => $problem")
              ws ! WsActorMessage("HttpError", HttpErrorOut(400, "BadRequest"))
          }

        case Right(MessageIn("management", TypeAndContentIn("UnsubscribeChannel", content))) =>
          content.as[Channel] match {
            case Right(Channel(channel)) =>
              bus.unsubscribe(self, channel)
              ws ! WsActorMessage("UnsubscribeChannelSuccess", channel)
            case Left(problem)           =>
              log.info(s"Badly formatted UnsubscribeChannel command: $text => $problem")
              ws ! WsActorMessage("HttpError", HttpErrorOut(400, "BadRequest"))
          }

        case Right(_)      =>
          log.info(s"Bad command: $text")
          ws ! WsActorMessage("HttpError", HttpErrorOut(400, "BadRequest"))
        case Left(problem) =>
          log.info(s"Badly formatted command: $text => $problem")
          ws ! WsActorMessage("HttpError", HttpErrorOut(400, "BadRequest"))
      }
    case NotificationManager      =>
      sendMessage(ws, db, token, workspaceId)

    case (channel: String, data: Json) =>
      val message = jsonString(MessageOut(channel, data))
      log.info(s"Messaging: Publishing ${message.take(250)} to client")
      ws ! TextMessage(message)

    // from WsFlow
    case "complete"                    =>
      log.info("The ws actor is completed")
      scheduleStop()

    // from WsFlow
    case t: Throwable                  =>
      log.warning(s"Exception in websocket handler, terminating:", t)
      ws ! WsActorMessage("HttpError", HttpErrorOut(500, "InternalServerError")) // 500
      scheduleStop()

    case msg =>
      log.error(s"Unhandled message: $msg")
  }

  def scheduleStop(): Unit = {
    bus.unsubscribe(self)
    val ctx = context // can't use context directly in the closure
    system.scheduler.scheduleOnce(500.millis) {
      ctx.stop(self)
    }
  }

}
