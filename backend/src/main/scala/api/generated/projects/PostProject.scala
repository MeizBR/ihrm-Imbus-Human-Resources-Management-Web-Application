/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.projects



case class PostProject(
  customerId: Int,
  name: String,
  description: Option[String],
  note: Option[String],
  isActive: Option[Boolean]
)

object PostProject {
  given  decoder: io.circe.Decoder[PostProject] = io.circe.generic.semiauto.deriveDecoder
  given  encoder: io.circe.Encoder[PostProject] = io.circe.generic.semiauto.deriveEncoder
}

