/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.users



case class PostUser(
  firstName: String,
  lastName: String,
  login: String,
  email: String,
  password: String,
  note: Option[String],
  isActive: Option[Boolean]
)

object PostUser {
  given decoder: io.circe.Decoder[PostUser] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostUser] = io.circe.generic.semiauto.deriveEncoder
}

