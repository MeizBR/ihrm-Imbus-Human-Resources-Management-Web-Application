/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.sessions



case class Notification(
  id: Int,
  notifiedUser: Int,
  description: String,
  userId: Option[Int],
  url: String,
  notificationType: String,
  createdAt: java.time.Instant,
  isRead: Boolean
)

object Notification {
  implicit val decoder: io.circe.Decoder[Notification] = io.circe.generic.semiauto.deriveDecoder
  implicit val encoder: io.circe.Encoder[Notification] = io.circe.generic.semiauto.deriveEncoder
}

