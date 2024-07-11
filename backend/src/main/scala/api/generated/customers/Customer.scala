/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.customers



case class Customer(
  id: Int,
  name: String,
  description: String,
  note: String,
  isActive: Boolean
)

object Customer {
  given decoder: io.circe.Decoder[Customer] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[Customer] = io.circe.generic.semiauto.deriveEncoder
}

