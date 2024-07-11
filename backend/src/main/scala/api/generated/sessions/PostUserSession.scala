/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.sessions



case class  PostUserSession(
  workspace: String,
  login: String,
  password: String
)

object PostUserSession {
  given decoder: io.circe.Decoder[PostUserSession] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostUserSession] = io.circe.generic.semiauto.deriveEncoder
}

