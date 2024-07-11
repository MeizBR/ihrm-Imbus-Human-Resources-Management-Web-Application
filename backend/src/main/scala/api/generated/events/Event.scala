/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.events



case class Event(
  id: Int,
  calendarId: Int,
  isPrivateCalendar: Boolean,
  start: java.time.Instant,
  end: java.time.Instant,
  title: String,
  description: String,
  repetition: String,
  allDay: Boolean,
  eventType: String,
  creator: Int
)

object Event {
  given decoder: io.circe.Decoder[Event] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[Event] = io.circe.generic.semiauto.deriveEncoder
}

