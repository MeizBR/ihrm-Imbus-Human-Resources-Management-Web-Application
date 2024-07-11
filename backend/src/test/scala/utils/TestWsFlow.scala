package utils

import db.Databases

import java.util.concurrent.atomic.AtomicLong
import org.apache.pekko.{actor, NotUsed}
import org.apache.pekko.actor.{ActorRef, ActorSystem}
import org.apache.pekko.http.scaladsl.model.ws.Message
import org.apache.pekko.stream.scaladsl.{Sink, Source}
import org.apache.pekko.stream.{CompletionStrategy, OverflowStrategy}
import org.apache.pekko.testkit.TestProbe
import wsActor.WsActor
import org.apache.pekko.actor.*
class TestWsFlow(workspaceId: Int, token: String, bus: MessagingBus, http: HttpClientForMsg, db: Databases)(implicit
    system: ActorSystem
) extends ClassLogging {
  private val id                                                          = new AtomicLong(0)
  private val completionMatcher: PartialFunction[Any, CompletionStrategy] = {
    case actor.Status.Success(s: CompletionStrategy) => s
    case actor.Status.Success(_)                     => CompletionStrategy.draining
    case actor.Status.Success                        => CompletionStrategy.draining
  }

  private val failureMatcher: PartialFunction[Any, Throwable] = { case actor.Status.Failure(cause) => cause }
  lazy val ws                                                 = system.actorOf(WsActor(bus, http, db), s"ws.${id.incrementAndGet}")

  lazy val probe = TestProbe()

  lazy val sink: Sink[Message, NotUsed] = Sink.actorRef[Message](
    probe.ref,
    "complete",
    (t: Throwable) => t
  )

  val source: ActorRef =
    Source.actorRef[Message](completionMatcher, failureMatcher, 100, OverflowStrategy.fail).to(sink).run()
}
