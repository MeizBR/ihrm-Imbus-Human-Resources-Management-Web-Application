/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.leaves



case class Leave(
  id: Int,
  start: java.time.LocalDate,
  isFullDayStart: Boolean,
  end: java.time.LocalDate,
  isFullDayEnd: Boolean,
  daysNumber: Double,
  userId: Int,
  leaveType: String,
  description: String,
  state: String,
  comment: String
)

object Leave {
  given decoder: io.circe.Decoder[Leave] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[Leave] = io.circe.generic.semiauto.deriveEncoder
}

