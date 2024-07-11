/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.sessions



case class PostAdminSession(
  login: String,
  password: String
)

object PostAdminSession {
  given decoder: io.circe.Decoder[PostAdminSession] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostAdminSession] = io.circe.generic.semiauto.deriveEncoder
}

