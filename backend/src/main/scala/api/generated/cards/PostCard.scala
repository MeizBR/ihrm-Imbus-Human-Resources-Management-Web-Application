/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.cards



case class PostCard(
  status: String,
  projectId: Int,
  project: String,
  cardType: String,
  title: String,
  assignee: String,
  priority: String,
  storyPoints: Option[Double],
  tags: Option[String],
  summary: Option[String]
)

object PostCard {
  given decoder: io.circe.Decoder[PostCard] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[PostCard] = io.circe.generic.semiauto.deriveEncoder
}

