/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.projects



case class PatchActivity(
  userId: Option[Int],
  projectId: Option[Int],
  description: Option[String],
  start: Option[java.time.Instant],
  end: Option[java.time.Instant]
)

object PatchActivity {
  given  decoder: io.circe.Decoder[PatchActivity] = io.circe.generic.semiauto.deriveDecoder
  given  encoder: io.circe.Encoder[PatchActivity] = io.circe.generic.semiauto.deriveEncoder
}

