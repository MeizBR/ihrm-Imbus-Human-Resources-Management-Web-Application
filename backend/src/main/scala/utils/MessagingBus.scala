package utils

import org.apache.pekko.actor.ActorRef
import org.apache.pekko.event.{ActorEventBus, LookupClassification}
import io.circe.Json

class MessagingBus extends ActorEventBus with LookupClassification {
  override type Event      = (String, Json)
  override type Classifier = String
  override protected def classify(event: Event): String                    = event._1
  override protected def publish(event: Event, subscriber: ActorRef): Unit = subscriber ! event
  override protected def mapSize(): Int                                    = 512
}
