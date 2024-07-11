/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.projects


case class Activity(
  id: Int,
  userId: Int,
  projectId: Int,
  description: String,
  start: java.time.Instant,
  end: Option[java.time.Instant]
)

object Activity {
  given  decoder: io.circe.Decoder[Activity] = io.circe.generic.semiauto.deriveDecoder
  given  encoder: io.circe.Encoder[Activity] = io.circe.generic.semiauto.deriveEncoder
}

