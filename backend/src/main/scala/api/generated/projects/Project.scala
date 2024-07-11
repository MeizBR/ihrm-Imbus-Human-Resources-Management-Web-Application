/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.projects



case class Project(
  id: Int,
  customerId: Int,
  name: String,
  description: String,
  note: String,
  isActive: Boolean
)

object Project {
  given  decoder: io.circe.Decoder[Project] = io.circe.generic.semiauto.deriveDecoder
  given  encoder: io.circe.Encoder[Project] = io.circe.generic.semiauto.deriveEncoder
}

