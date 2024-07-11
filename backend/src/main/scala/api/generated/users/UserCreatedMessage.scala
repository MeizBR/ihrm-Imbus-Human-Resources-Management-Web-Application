/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.users



case class UserCreatedMessage(
  id: Int,
  firstName: String,
  lastName: String,
  login: String,
  email: String,
  note: String,
  isActive: Boolean
)

object UserCreatedMessage {
  given decoder: io.circe.Decoder[UserCreatedMessage] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[UserCreatedMessage] = io.circe.generic.semiauto.deriveEncoder
}

