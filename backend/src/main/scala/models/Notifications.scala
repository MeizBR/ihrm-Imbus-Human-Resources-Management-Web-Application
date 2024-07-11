package models
import db.{Databases, Notification, Schema}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.{Forbidden, InternalServerError, NoContent, NotFound}
import utils.ClassLogging
import utils.DefaultValues.defaultCardType

import scala.concurrent.ExecutionContext.global
import scala.concurrent.{ExecutionContextExecutor, Future}

object Notifications extends Schema with ClassLogging {

  import config.profile.api._
  implicit private val ec: ExecutionContextExecutor = global

  def getUserNotifications(db: Databases, workspaceId: Int, usersId: Int): Future[Seq[Notification]] =
    db.engine.run(notifications.filter(n => n.notifiedUser === usersId && n.workspaceId === workspaceId).result)

  def createNotification(
      db: Databases,
      newNotification: Notification
  ): Future[Either[(StatusCode, String), Notification]] = {
    println("test")
    db.engine
      .run(
        users
          .filter(u => u.workspaceId === newNotification.workspaceId && u.id === newNotification.notifiedUser)
          .result
          .headOption
      )
      .flatMap {
        case Some(n) =>
          val insertAction = (notifications returning notifications.map(_.id)) += newNotification
          db.engine
            .run(insertAction)
            .flatMap { notificationId =>
              println(notificationId)
              val notification = db.engine.run(notifications.filter(_.id === notificationId).result.headOption)
              notification
            }
            .map {
              case Some(notification) => Right(notification)
              case None               =>
                println("Failed to fetch the inserted notification")
                Left((InternalServerError, "Internal Server Error"))
            }
        case None    =>
          Future(Left(NotFound, "Not found."))
      }
  }

  def markAsRead(
      db: Databases,
      workspaceId: Int,
      notificationId: Int
  ): Future[Either[(StatusCode, String), Notification]] =
    db.engine
      .run(notifications.filter(n => n.id === notificationId && n.workspaceId === workspaceId).result.headOption)
      .flatMap {
        case Some(notification) =>
          val updateAction = notifications.filter(_.id === notificationId).map(_.isRead).update(true)
          db.engine.run(updateAction).map(_ => Right(notification.copy(isRead = true))).recover { case e: Throwable =>
            log.error(s"Failed to mark notification as read: ${e.getMessage}")
            Left(InternalServerError -> "Internal Server Error")
          }
        case None               =>
          Future.successful(Left(NotFound -> "Notification not found"))
      }

  def deleteNotification(db: Databases, workspaceId: Int, notificationId: Int): Future[(StatusCode, String)] =
    db.engine
      .run(notifications.filter(n => n.id === notificationId && n.workspaceId === workspaceId).result.headOption)
      .flatMap {
        case None => Future.successful(Forbidden -> "Forbidden or notifications not found.")
        case _    =>
          db.engine
            .run(notifications.filter(_.id === notificationId).delete)
            .map(_ => NoContent -> "The notifications were successfully deleted.")
      }

  def deleteAllNotification(db: Databases, workspaceId: Int, userId: Int): Future[(StatusCode, String)] =
    db.engine
      .run(notifications.filter(n => n.workspaceId === workspaceId && n.notifiedUser === userId).result)
      .flatMap { DeletedNotifications =>
        if (DeletedNotifications.nonEmpty) {
          db.engine
            .run(notifications.filter(_.notifiedUser === userId).delete)
            .map(_ => NoContent -> "The notifications were successfully deleted.")
            .recover { case e: Throwable =>
              log.error(s"The notifications with userId $userId could not be deleted:\n ${e.getMessage}")
              InternalServerError -> "Failed to delete these notifications."
            }
        } else {
          Future.successful(Forbidden -> "Forbidden or notifications not found.")
        }
      }

  def markAllAsRead(
      db: Databases,
      workspaceId: Int,
      userId: Int
  ): Future[Either[(StatusCode, String), Seq[Notification]]] =
    db.engine
      .run(notifications.filter(n => n.workspaceId === workspaceId && n.notifiedUser === userId).result)
      .flatMap { updatedNotifications =>
        val updateAction = notifications.filter(_.notifiedUser === userId).map(_.isRead).update(true)
        db.engine.run(updateAction).map(_ => Right(updatedNotifications.map(n => n.copy(isRead = true)))).recover {
          case e: Throwable =>
            log.error(s"Failed to mark notifications as read: ${e.getMessage}")
            Left(InternalServerError -> "Internal Server Error")
        }
      }
      .recover { case e: Throwable =>
        log.error(s"Failed to find notifications to mark as read:\n${e.getMessage}")
        Left(InternalServerError -> "Internal Server Error")
      }
}
