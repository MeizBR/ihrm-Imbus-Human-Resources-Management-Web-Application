package wsActor

import db.Databases

import java.util.concurrent.atomic.AtomicLong
import org.apache.pekko.{actor, NotUsed}
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}
import org.apache.pekko.stream.scaladsl.{Flow, Sink, Source}
import org.apache.pekko.stream.{CompletionStrategy, OverflowStrategy}
import utils.{ClassLogging, HttpClientForMsg, MessagingBus}
import org.apache.pekko.actor.*
object WsFlow extends ClassLogging {
  private val id                                                          = new AtomicLong(0)
  private val completionMatcher: PartialFunction[Any, CompletionStrategy] = {
    case actor.Status.Success(s: CompletionStrategy) => s
    case actor.Status.Success(_)                     => CompletionStrategy.draining
    case actor.Status.Success                        => CompletionStrategy.draining
  }
  private val failureMatcher: PartialFunction[Any, Throwable]             = { case actor.Status.Failure(cause) => cause }

  def Apply(workspaceId: Int, token: String, bus: MessagingBus, httpClient: HttpClientForMsg, db: Databases)(using
      system: ActorSystem
  ): Flow[Message, Message, NotUsed] = {
    println("222")
    val ws = system.actorOf(WsActor(bus, httpClient, db), s"ws.${id.incrementAndGet}")

    def source =
      Source
        .actorRef[Message](completionMatcher, failureMatcher, 100, OverflowStrategy.fail)
        .mapMaterializedValue(source => ws ! (source, workspaceId, token))

    val sink = Sink.actorRef[Message](
      ws,
      "complete",
      (t: Throwable) => t
    )
    Flow.fromSinkAndSourceCoupled(sink, source)

  }

}
