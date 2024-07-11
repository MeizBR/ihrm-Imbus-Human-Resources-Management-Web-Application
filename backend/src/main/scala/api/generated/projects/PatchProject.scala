/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.projects



case class PatchProject(
  customerId: Option[Int],
  name: Option[String],
  description: Option[String],
  note: Option[String],
  isActive: Option[Boolean]
)

object PatchProject {
  given decoder: io.circe.Decoder[PatchProject] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchProject] = io.circe.generic.semiauto.deriveEncoder
}

