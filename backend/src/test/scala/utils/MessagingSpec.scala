package utils
import db.Databases
import org.apache.pekko.actor.*
import org.apache.pekko.http.scaladsl.model.ws.TextMessage
import org.apache.pekko.testkit.{ImplicitSender, TestKit}
import io.circe.*
import io.circe.generic.auto.*
import io.circe.syntax.EncoderOps
import org.specs2.SpecificationLike
import org.specs2.execute.Result
import wsActor.WsActor.*

abstract class MessagingSpec
    extends TestKit(ActorSystem("messagingTests"))
    with ImplicitSender
    with SpecificationLike
    with ClassLogging {

  def workspaceId: Int
  def token: String
  def bus: MessagingBus
  def httpClient: HttpClientForMsg
  def db: Databases

  lazy val wsFlow: TestWsFlow = new TestWsFlow(workspaceId, token, bus, httpClient, db).tap { testWsFlow =>
    testWsFlow.ws ! (testWsFlow.source, workspaceId, token)
  }

  private def subscribeChannel(channel: String)   = TextMessage(
    MessageIn("management", TypeAndContentIn("SubscribeChannel", Channel(channel).asJson)).asJson.toString
  )
  private def unsubscribeChannel(channel: String) = TextMessage(
    MessageIn("management", TypeAndContentIn("UnsubscribeChannel", Channel(channel).asJson)).asJson.toString
  )

  protected def expectMessage[T: Encoder](channel: String, messageType: String, data: T): Result = {
    val message = jsonString(MessageOut(channel, Update(messageType, data)))
    wsFlow.probe.expectMsg[TextMessage](TextMessage(message))
    success
  }

  protected def listeningTo[T: Encoder](channel: String, existingContent: T)(test: String => Result): Result = {
    val subscriptionResult = jsonString(MessageOut(channel, GetBody(existingContent.asJson)))
    wsFlow.ws ! subscribeChannel(channel)
    wsFlow.probe.expectMsg[TextMessage](TextMessage(subscriptionResult))
    test(channel) and {
      wsFlow.ws ! unsubscribeChannel(channel)
      wsFlow.probe.expectMsg[TextMessage](WsActorMessage("UnsubscribeChannelSuccess", channel))
      success
    }
  }
}
