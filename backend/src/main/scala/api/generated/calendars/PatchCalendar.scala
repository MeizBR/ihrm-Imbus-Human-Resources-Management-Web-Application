/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.calendars



case class PatchCalendar(
  name: Option[String],
  projectId: Option[Int],
  description: Option[String],
  isPrivate: Option[Boolean],
  timeZone: Option[String]
)

object PatchCalendar {
  given decoder: io.circe.Decoder[PatchCalendar] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchCalendar] = io.circe.generic.semiauto.deriveEncoder
}

