/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.projects



case class PostActivity(
  userId: Int,
  projectId: Int,
  description: String
)

object PostActivity {
  given  decoder: io.circe.Decoder[PostActivity] = io.circe.generic.semiauto.deriveDecoder
  given  encoder: io.circe.Encoder[PostActivity] = io.circe.generic.semiauto.deriveEncoder
}

