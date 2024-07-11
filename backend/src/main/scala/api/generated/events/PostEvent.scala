/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.events



case class PostEvent(
  calendarId: Int,
  start: java.time.Instant,
  end: java.time.Instant,
  title: String,
  description: Option[String],
  repetition: Option[String],
  allDay: Boolean,
  eventType: String
)

object PostEvent {
  given decoder: io.circe.Decoder[PostEvent] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostEvent] = io.circe.generic.semiauto.deriveEncoder
}

