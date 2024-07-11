/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.tasks

case class Task(
  id: Int,
  name: String,
  key: String,
  index: Int
)

object Task {
  given decoder: io.circe.Decoder[Task] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[Task] = io.circe.generic.semiauto.deriveEncoder
}


