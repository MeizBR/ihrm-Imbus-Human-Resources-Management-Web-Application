/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.sessions



case class UserSession(
  workspaceId: Int,
  userId: Int,
  fullName: String,
  token: String,
  globalRoles: List[String]
)

object UserSession {
  given decoder: io.circe.Decoder[UserSession] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[UserSession] = io.circe.generic.semiauto.deriveEncoder
}

