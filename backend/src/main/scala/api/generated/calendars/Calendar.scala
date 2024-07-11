/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.calendars



case class Calendar(
  id: Int,
  name: String,
  projectId: Option[Int],
  description: String,
  isPrivate: Boolean,
  userId: Int,
  timeZone: String
)

object Calendar {
  given decoder: io.circe.Decoder[Calendar] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[Calendar] = io.circe.generic.semiauto.deriveEncoder
}

