/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.users



case class PatchUserBySuperAdmin(
  firstName: Option[String],
  lastName: Option[String],
  login: Option[String],
  email: Option[String],
  password: Option[String],
  note: Option[String],
  isActive: Option[Boolean]
)

object PatchUserBySuperAdmin {
  given decoder: io.circe.Decoder[PatchUserBySuperAdmin] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchUserBySuperAdmin] = io.circe.generic.semiauto.deriveEncoder
}

