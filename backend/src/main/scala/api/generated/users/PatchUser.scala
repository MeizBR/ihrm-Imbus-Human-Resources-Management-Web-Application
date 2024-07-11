/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.users



case class PatchUser(
  firstName: Option[String],
  lastName: Option[String],
  login: Option[String],
  email: Option[String],
  password: Option[Password],
  note: Option[String],
  isActive: Option[Boolean]
)

object PatchUser {
  given decoder: io.circe.Decoder[PatchUser] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchUser] = io.circe.generic.semiauto.deriveEncoder
}

