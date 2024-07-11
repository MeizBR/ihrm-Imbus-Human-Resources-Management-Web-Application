/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.workspaces



case class PatchWorkspace(
  name: Option[String],
  description: Option[String],
  isActive: Option[Boolean]
)

object PatchWorkspace {
  given decoder: io.circe.Decoder[PatchWorkspace] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchWorkspace] = io.circe.generic.semiauto.deriveEncoder
}

