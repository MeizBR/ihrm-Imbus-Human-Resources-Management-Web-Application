/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.events



case class PatchEvent(
  calendarId: Option[Int],
  start: Option[java.time.Instant],
  end: Option[java.time.Instant],
  title: Option[String],
  description: Option[String],
  repetition: Option[String],
  allDay: Option[Boolean],
  eventType: Option[String]
)

object PatchEvent {
  given decoder: io.circe.Decoder[PatchEvent] = io.circe.generic.semiauto.deriveDecoder
  given  encoder: io.circe.Encoder[PatchEvent] = io.circe.generic.semiauto.deriveEncoder
}

