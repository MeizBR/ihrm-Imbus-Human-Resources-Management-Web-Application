/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.leaves



case class PutLeave(
  state: Option[String],
  comment: Option[String]
)

object PutLeave {
  given decoder: io.circe.Decoder[PutLeave] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PutLeave] = io.circe.generic.semiauto.deriveEncoder
}

