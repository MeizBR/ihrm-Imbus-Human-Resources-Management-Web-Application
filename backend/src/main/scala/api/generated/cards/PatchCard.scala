/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.cards



case class PatchCard(
  status: Option[String],
  projectId: Option[Int],
  project: Option[String],
  cardType: Option[String],
  title: Option[String],
  assignee: Option[String],
  priority: Option[String],
  storyPoints: Option[Double],
  tags: Option[String],
  summary: Option[String]
)

object PatchCard {
  given decoder: io.circe.Decoder[PatchCard] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PatchCard] = io.circe.generic.semiauto.deriveEncoder
}

