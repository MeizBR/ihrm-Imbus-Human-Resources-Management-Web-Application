/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.tasks

case class PostTask(
  name: String,
  key: String,
  index: Int
)

object PostTask {
  given decoder: io.circe.Decoder[PostTask] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostTask] = io.circe.generic.semiauto.deriveEncoder
}

