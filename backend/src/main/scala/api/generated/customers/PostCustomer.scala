/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.customers



case class PostCustomer(
  name: String,
  description: Option[String],
  note: Option[String],
  isActive: Option[Boolean]
)

object PostCustomer {
  given decoder: io.circe.Decoder[PostCustomer] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostCustomer] = io.circe.generic.semiauto.deriveEncoder
}

