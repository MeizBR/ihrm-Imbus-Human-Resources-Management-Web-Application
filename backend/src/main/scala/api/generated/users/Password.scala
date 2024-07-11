/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.users



case class Password(
  passwordOfConnectedUser: String,
  newPassword: String
)

object Password {
  given decoder: io.circe.Decoder[Password] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[Password] = io.circe.generic.semiauto.deriveEncoder
}

