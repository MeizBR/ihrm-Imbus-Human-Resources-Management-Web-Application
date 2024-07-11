/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.leaves



case class PatchLeave(
  start: Option[java.time.LocalDate],
  isFullDayStart: Option[Boolean],
  end: Option[java.time.LocalDate],
  isFullDayEnd: Option[Boolean],
  daysNumber: Option[Double],
  leaveType: Option[String],
  description: Option[String]
)

object PatchLeave {
  given decoder: io.circe.Decoder[PatchLeave] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchLeave] = io.circe.generic.semiauto.deriveEncoder
}

