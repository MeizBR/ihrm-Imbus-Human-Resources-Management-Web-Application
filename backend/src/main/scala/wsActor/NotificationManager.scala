package wsActor

import api.enumeration.{GlobalRole, NotificationType}
import controllers.*
import controllers.SessionHandler.userSessions
import db.{Databases, Leave, Notification}
import io.circe.syntax.EncoderOps
import models.ProjectUsers.getProductRoles
import models.Projects.getProjectById
import models.Users.getAdminsIds
import models.{Activities, Notifications, Users}
import org.apache.pekko.actor.ActorRef
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.{InternalServerError, NotFound}
import org.apache.pekko.http.scaladsl.model.ws.TextMessage
import java.time.{Instant, ZoneId}
import scala.concurrent.ExecutionContext.global
import scala.concurrent.{ExecutionContextExecutor, Future}
object NotificationManager {
  private var activitiesId: Seq[Int]   = Seq.empty[Int]
  var notifications: Seq[Notification] = Seq.empty[Notification]
  var token: String                    = _

  case class NotificationManager(ws: ActorRef, db: Databases, token: String, workspaceId: Int)

  given ec: ExecutionContextExecutor                                                  = global
  def sendMessage(ws: ActorRef, db: Databases, token: String, workspaceId: Int): Unit = {
    this.token = token
    checkAndNotify(workspaceId, db)
    getUserRole(workspaceId, token, db).foreach {
      case Right((_, userId))          =>
        val notificationsToSend = notifications.filter(_.notifiedUser == userId)
        if (notificationsToSend.nonEmpty) {
          ws ! TextMessage(notificationsToSend.map(_.toRest).asJson.toString())
          notifications = notifications.filterNot(_.notifiedUser == userId)
        }
      case Left((statusCode, message)) =>
        println(s"Error: $statusCode - $message")
    }
    ws ! TextMessage(Seq.empty[Notification].map(_.toRest).asJson.toString())
  }
  private def checkAndNotify(workspaceId: Int, db: Databases): Unit                   =
    Activities.getActivitiesWithoutEnd(db, workspaceId).map { activities =>
      activities.foreach { activity =>
        if (!activitiesId.contains(activity.activityId)) {
          activitiesId = activitiesId :+ activity.activityId
          getAdminsIds(db, workspaceId).map {
            _.foreach { id =>
              val notification = Notification(
                workspaceId = workspaceId,
                notifiedUser = id,
                description = s"initiated ${activity.description} activity over 8 hours ago",
                url = "/home/reports/summary",
                userId = Some(activity.userId),
                notificationType = NotificationType.Activity
              )
              addNotification(notification, db)
            }
          }

        }
      }
    }

  def leaveNotificationForAdmin(workspaceId: Int, leave: Leave, db: Databases): Unit =
    getAdminsIds(db, workspaceId).map {
      _.foreach { id =>
        val notification = Notification(
          workspaceId = workspaceId,
          notifiedUser = id,
          description = s"requests ${leave.daysNumber} days off from ${Instant
              .ofEpochSecond(leave.start)
              .atZone(ZoneId.systemDefault)
              .toLocalDate
              .toString}  to ${Instant.ofEpochSecond(leave.end).atZone(ZoneId.systemDefault()).toLocalDate.toString} ",
          url = s"/home/leaves/leave/${leave.leaveId}",
          userId = Some(leave.userId),
          notificationType = NotificationType.Leave
        )
        addNotification(notification, db)
      }
    }

  def leaveNotificationForUser(workspaceId: Int, leave: Leave, db: Databases): Unit = {
    val notification = Notification(
      workspaceId = workspaceId,
      notifiedUser = leave.userId,
      description = s"Your leave request has been ${leave.adaptedLeaveState.toString}",
      url = s"/home/leaves/leave/${leave.leaveId}",
      userId = Some(leave.userId),
      notificationType = NotificationType.Leave
    )
    addNotification(notification, db)
  }

  def projectNotificationForUser(userId: Int, projectId: Int, workspaceId: Int, db: Databases): Unit = {
    println("888")
    getProjectById(db, workspaceId, projectId).map { p =>
      p.map { project =>
        getProductRoles(db, workspaceId, userId, project.projectId).map { roles =>
          roles.foreach { role =>
            val notification = Notification(
              workspaceId = workspaceId,
              notifiedUser = userId,
              description = s"Your are the  ${role.toString} of the ${project.name} project ",
              url = s"/home/projects/details/${project.projectId}",
              userId = Some(userId),
              notificationType = NotificationType.Leave
            )
            addNotification(notification, db)
          }
        }
      }
    }

  }

  private def addNotification(notification: Notification, db: Databases): Future[Unit] =
    Notifications.createNotification(db, notification).flatMap {
      case Right(notification) =>
        println(notification)
        notifications = notifications :+ notification
        Future.successful(())
      case Left(error)         =>
        Future.failed(new Exception(s"Error creating notification: $error"))
    }
  private def getUserRole(
      workspaceId: Int,
      token: String,
      db: Databases
  ): Future[Either[(StatusCode, String), (Set[GlobalRole], Int)]] =
    userSessions.get((workspaceId, token)) match {
      case Some(userId) =>
        Users.getRoles(db, workspaceId, userId, None).map {
          case Some((globalRoles, _)) => Right((globalRoles, userId))
          case _                      => Left((InternalServerError, "Failed to retrieve user roles."))
        }
      case None         =>
        Future.successful(Left((NotFound, "User session not found.")))
    }

}
