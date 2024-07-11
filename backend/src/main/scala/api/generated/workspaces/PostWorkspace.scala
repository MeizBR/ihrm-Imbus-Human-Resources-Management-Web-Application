/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.workspaces



case class PostWorkspace(
  name: String,
  description: Option[String],
  isActive: Option[Boolean]
)

object PostWorkspace {
  given decoder: io.circe.Decoder[PostWorkspace] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostWorkspace] = io.circe.generic.semiauto.deriveEncoder
}

