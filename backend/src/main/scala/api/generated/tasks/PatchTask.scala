/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.tasks

case class PatchTask(
  name: Option[String],
  key: Option[String],
  index: Option[Int]
)

object PatchTask {
  given decoder: io.circe.Decoder[PatchTask] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchTask] = io.circe.generic.semiauto.deriveEncoder
}
