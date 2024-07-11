/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.customers



case class PatchCustomer(
  name: Option[String],
  description: Option[String],
  note: Option[String],
  isActive: Option[Boolean]
)

object PatchCustomer {
  given decoder: io.circe.Decoder[PatchCustomer] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchCustomer] = io.circe.generic.semiauto.deriveEncoder
}

