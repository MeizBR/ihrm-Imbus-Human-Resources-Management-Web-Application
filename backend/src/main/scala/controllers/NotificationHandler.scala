package controllers
import db.*
import io.circe.syntax.*
import models.Notifications
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import utils.RestErrorFactory.*
import utils.pekkohttpcirce.FailFastCirceSupport.*
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor

object NotificationHandler {
  implicit private val ec: ExecutionContextExecutor                                 = global
  implicit val notificationsOrdering: Ordering[api.generated.sessions.Notification] = Ordering by {
    (_: api.generated.sessions.Notification).id
  }
  def readUserNotification(db: Databases, workspaceId: Int, userId: Int): Route     = complete(
    Notifications
      .getUserNotifications(db, workspaceId, userId)
      .map[ToResponseMarshallable](_.map(n => n.toRest).sorted.reverse.asJson)
  )

  def markAsRead(db: Databases, workspaceId: Int, notificationId: Int): Route         = complete(
    Notifications.markAsRead(db, workspaceId, notificationId).map[ToResponseMarshallable] {
      case Right(notification) => StatusCodes.Created -> notification.toRest
      case Left(response)      => response._1         -> Failure(response._2)
    }
  )
  def deleteNotification(db: Databases, workspaceId: Int, notificationId: Int): Route = complete {
    Notifications
      .deleteNotification(db, workspaceId, notificationId)
      .map[ToResponseMarshallable](response => response._1 -> Failure(response._2))

  }

  def marAllAsRead(db: Databases, workspaceId: Int, userId: Int): Route = complete(
    Notifications.markAllAsRead(db, workspaceId, userId).map[ToResponseMarshallable] {
      case Left((statusCode, message)) => (statusCode, message)
      case Right(notifications)        => notifications.map(_.toRest).sorted.reverse.asJson
    }
  )

  def deleteAllNotification(db: Databases, workspaceId: Int, notificationId: Int): Route = complete {
    Notifications
      .deleteAllNotification(db, workspaceId, notificationId)
      .map[ToResponseMarshallable](response => response._1 -> Failure(response._2))
  }
}
