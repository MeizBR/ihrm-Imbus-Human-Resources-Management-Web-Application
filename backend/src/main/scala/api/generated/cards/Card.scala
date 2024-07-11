/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.cards



case class Card(
  id: Int,
  status: String,
  projectId: Int,
  project: String,
  cardType: String,
  title: String,
  assignee: String,
  priority: String,
  storyPoints: Double,
  tags: String,
  summary: String
)

object Card {
  given decoder: io.circe.Decoder[Card] = io.circe.generic.semiauto.deriveDecoder
  given encoder: io.circe.Encoder[Card] = io.circe.generic.semiauto.deriveEncoder
}

