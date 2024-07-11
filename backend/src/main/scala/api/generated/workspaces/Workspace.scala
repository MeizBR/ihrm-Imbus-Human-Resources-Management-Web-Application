/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.workspaces



case class Workspace(
  id: Int,
  name: String,
  description: String,
  isActive: Boolean
)

object Workspace {
  given decoder: io.circe.Decoder[Workspace] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[Workspace] = io.circe.generic.semiauto.deriveEncoder
}

