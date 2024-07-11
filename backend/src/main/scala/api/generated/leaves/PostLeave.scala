/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.leaves



case class PostLeave(
  start: java.time.LocalDate,
  isFullDayStart: Boolean,
  end: java.time.LocalDate,
  isFullDayEnd: Boolean,
  daysNumber: Double,
  leaveType: String,
  description: String,
  state: Option[String]
)

object PostLeave {
  given decoder: io.circe.Decoder[PostLeave] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostLeave] = io.circe.generic.semiauto.deriveEncoder
}

