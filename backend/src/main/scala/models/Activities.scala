package models

import api.generated.projects.{PatchActivity, PostActivity}
import db.{Activity, Databases, Notification, Schema}
import models.Notifications.{log, notifications, users}
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes._
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.enumeration.{GlobalRole, ProjectRole}
import api.generated.projects.{PatchActivity, PostActivity}
import db.{Activity, Databases, Schema}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.*
import utils.ClassLogging

import java.time.{Instant, ZoneId}
import java.util.TimeZone
import scala.concurrent.ExecutionContext.global
import scala.concurrent.{ExecutionContextExecutor, Future}

object Activities extends Schema with ClassLogging {

  import config.profile.api.*

  given ec: ExecutionContextExecutor = global

  def read(
      db: Databases,
      workspaceId: Int,
      maybeUserId: Option[Int],
      maybeProjectId: Option[Int],
      from: Option[java.time.LocalDate],
      to: Option[java.time.LocalDate]
  ): Future[Either[(StatusCode, String), Seq[Activity]]] = {
    val longFrom = from.map(_.atStartOfDay(ZoneId.of(TimeZone.getDefault.getID)).toInstant.toEpochMilli).getOrElse(-1L)
    val longTo   =
      to.map(_.atStartOfDay(ZoneId.of(TimeZone.getDefault.getID)).toInstant.toEpochMilli).getOrElse(Long.MaxValue)
    db.engine
      .run(((maybeUserId, maybeProjectId) match {
        case (Some(userId), Some(projectId)) =>
          activities.filter(a =>
            (a.workspaceId === workspaceId) && (a.projectId === projectId) && (a.userId === userId) && (a.start >= longFrom) && (a.start <= longTo)
          )
        case (Some(userId), None)            =>
          activities.filter(a =>
            (a.workspaceId === workspaceId) && (a.userId === userId) && (a.start >= longFrom) && (a.start <= longTo)
          )
        case (None, Some(projectId))         =>
          activities.filter(a =>
            (a.workspaceId === workspaceId) && (a.projectId === projectId) && (a.start >= longFrom) && (a.start <= longTo)
          )
        case (None, None)                    =>
          activities.filter(a => (a.workspaceId === workspaceId) && (a.start >= longFrom) && (a.start <= longTo))
      }).result)
      .recover { case e: Throwable =>
        log.error(s"Failed to read all activities:\n ${e.getMessage}")
        Seq.empty[Activity]
      }
      .flatMap { case activities: Seq[Activity] =>
        Future(Right(activities))
      // case _                         => Future(Left(NotFound, "Not found."))
      }
  }
  def getActivitiesWithoutEnd(db: Databases, workspaceId: Int): Future[Seq[Activity]] = {
    val time = Instant.now().toEpochMilli
    db.engine
      .run(
        activities.filter(a => a.workspaceId === workspaceId && a.end.isEmpty && a.start - time <= -28800000L).result
      )
      .recover { case e: Throwable =>
        log.error(s"Failed to read  activities:\n ${e.getMessage}")
        Seq.empty[Activity]
      }
  }

  def getUserProjectsActivities(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      mateId: Option[Int],
      from: Option[java.time.LocalDate],
      to: Option[java.time.LocalDate]
  ): Future[Seq[Activity]] = {
    val userProjectsFuture = ProjectUsers.getUserProjects(db, workspaceId, userId)
    for {
      userProjects      <- userProjectsFuture
      projectActivities <- getActivitiesByProjectIds(db, workspaceId, userProjects.map(_.projectId), from, to)
    } yield mateId.fold(projectActivities) { id =>
      projectActivities.filter(act => act.userId == id)
    }
  }

  private def getActivitiesByProjectIds(
      db: Databases,
      workspaceId: Int,
      projectIds: Seq[Int],
      from: Option[java.time.LocalDate],
      to: Option[java.time.LocalDate]
  ): Future[Seq[Activity]] = {
    val longFrom = from.map(_.atStartOfDay(ZoneId.of(TimeZone.getDefault.getID)).toInstant.toEpochMilli).getOrElse(-1L)
    val longTo   =
      to.map(_.atStartOfDay(ZoneId.of(TimeZone.getDefault.getID)).toInstant.toEpochMilli).getOrElse(Long.MaxValue)
    db.engine
      .run(
        activities
          .filter(a =>
            (a.workspaceId === workspaceId) && (a.projectId inSet projectIds) && (a.start >= longFrom) && (a.start <= longTo)
          )
          .result
      )
      .recover { case e: Throwable =>
        log.error(s"Failed to find activities:\n ${e.getMessage}")
        Seq.empty[Activity]
      }
  }

  def create(
      db: Databases,
      workspaceId: Int,
      connectedUserGlobalRoles: Set[GlobalRole],
      newActivity: PostActivity
  ): Future[Either[(StatusCode, String), Activity]] =
    db.engine
      .run(users.filter(user => user.workspaceId === workspaceId && user.id === newActivity.userId).result.headOption)
      .flatMap {
        case Some(user) =>
          if (user.active)
            Users.getRoles(db, workspaceId, newActivity.userId, Some(newActivity.projectId)).flatMap {
              case Some((globalRoles, projectRoles))
                  if globalRoles.contains(GlobalRole.Administrator) || projectRoles.contains(
                    ProjectRole.Lead
                  ) || projectRoles.contains(ProjectRole.Supervisor) || projectRoles.contains(ProjectRole.Member) =>
                db.engine
                  .run(
                    projects
                      .filter(p => p.workspaceId === workspaceId && p.id === newActivity.projectId && !p.isDeleted)
                      .result
                      .headOption
                  )
                  .flatMap {
                    case Some(_)                                                             =>
                      insertActivity(db, workspaceId, newActivity)
                    case None if connectedUserGlobalRoles.contains(GlobalRole.Administrator) =>
                      Future.successful(Left(NotFound, "Not found."))
                    case _                                                                   => Future.successful(Left(Forbidden, "Forbidden or workspace not found."))
                  }
                  .recover { case e: Throwable =>
                    log.error(s"Failed find projects:\n ${e.getMessage}")
                    Left(InternalServerError, "Internal Server Error\", \"There was an internal server error.")
                  }
              case _ => Future(Left(Forbidden, "Forbidden or workspace not found."))
            }
          else Future(Left(Forbidden, "You cannot create an activity for an inactive user."))
        case None       => Future(Left(NotFound, "Not found."))
      }

  def insertActivity(
      db: Databases,
      workspaceId: Int,
      newActivity: PostActivity
  ): Future[Either[(StatusCode, String), Activity]] =
    db.engine
      .run(
        activities
          .filter(a => a.userId === newActivity.userId && a.end.isEmpty)
          .map(_.end)
          .update(Some(Instant.now.toEpochMilli))
      )
      .recover { case e: Throwable =>
        log.error(s"Failed to update user's current activity:\n ${e.getMessage}")
        Left(InternalServerError, "Internal Server Error\", \"There was an internal server error.")
      } flatMap { _ =>
      db.engine
        .run(
          (activities.map(a => (a.workspaceId, a.userId, a.projectId, a.description, a.start)) returning activities
            .map(_.id)) += (
            workspaceId, newActivity.userId, newActivity.projectId, newActivity.description, Instant.now.toEpochMilli
          )
        )
        .flatMap(id =>
          db.engine.run(activities.filter(_.id === id).result.headOption).map {
            case Some(activity: Activity) => Right(activity)
            case _                        => Left(UnprocessableEntity, "\"Unable to create the activity.\"")
          }
        )
    }

  def patch(
      db: Databases,
      workspaceId: Int,
      activityId: Int,
      newActivityData: PatchActivity,
      connectedUserGlobalRoles: Set[GlobalRole],
      connectedUserProjectRoles: Set[ProjectRole]
  ): Future[Either[(StatusCode, String), Activity]] =
    db.engine
      .run(activities.filter(ac => ac.id === activityId && ac.workspaceId === workspaceId).result.headOption)
      .flatMap {
        case Some(oldActivity: Activity) =>
          db.engine
            .run(
              users
                .filter(user =>
                  user.workspaceId === workspaceId && user.id === newActivityData.userId.getOrElse(oldActivity.userId)
                )
                .result
                .headOption
            )
            .flatMap {
              case Some(user) =>
                if (user.active)
                  (newActivityData.projectId, newActivityData.userId) match {
                    // Note: Check if the userIdForPatch has role in the projectIdForPatch
                    case (Some(projectIdForPatch), Some(userIdForPatch)) =>
                      if (
                        (userIdForPatch != oldActivity.userId && connectedUserGlobalRoles.contains(
                          GlobalRole.Administrator
                        ) || connectedUserProjectRoles.contains(
                          ProjectRole.Lead
                        )) || userIdForPatch == oldActivity.userId
                      )
                        Users.getRoles(db, workspaceId, userIdForPatch, Some(projectIdForPatch)).flatMap {
                          case Some((globalRoles, projectRoles))
                              if projectRoles.nonEmpty || globalRoles.contains(GlobalRole.Administrator) =>
                            checkProjectExistenceBeforeUpdating(
                              db,
                              workspaceId,
                              activityId,
                              projectIdForPatch,
                              newActivityData,
                              oldActivity
                            )
                          case Some((_, projectRoles)) if projectRoles.nonEmpty =>
                            checkProjectExistenceBeforeUpdating(
                              db,
                              workspaceId,
                              activityId,
                              projectIdForPatch,
                              newActivityData,
                              oldActivity
                            )
                          case _                                                => Future(Left(Forbidden, "Forbidden or workspace not found."))
                        }
                      else Future(Left(Forbidden, "Forbidden or workspace not found."))
                    // Note: Check if the oldActivity.userId has role in the projectIdForPatch
                    case (Some(projectIdForPatch), None)                 =>
                      Users.getRoles(db, workspaceId, oldActivity.userId, Some(projectIdForPatch)).flatMap {
                        case Some((globalRoles, projectRoles))
                            if projectRoles.nonEmpty || globalRoles.contains(GlobalRole.Administrator) =>
                          checkProjectExistenceBeforeUpdating(
                            db,
                            workspaceId,
                            activityId,
                            projectIdForPatch,
                            newActivityData,
                            oldActivity
                          )
                        case Some((_, projectRoles)) if projectRoles.nonEmpty =>
                          checkProjectExistenceBeforeUpdating(
                            db,
                            workspaceId,
                            activityId,
                            projectIdForPatch,
                            newActivityData,
                            oldActivity
                          )
                        case _                                                => Future(Left(Forbidden, "Forbidden or workspace not found."))
                      }
                    // Note: Check if the userIdForPatch has role in the oldActivity.projectId
                    case (None, Some(userIdForPatch))                    =>
                      if (
                        (userIdForPatch != oldActivity.userId && connectedUserGlobalRoles.contains(
                          GlobalRole.Administrator
                        ) || connectedUserProjectRoles.contains(
                          ProjectRole.Lead
                        )) || userIdForPatch == oldActivity.userId
                      )
                        Users.getRoles(db, workspaceId, userIdForPatch, Some(oldActivity.projectId)).flatMap {
                          case Some((globalRoles, projectRoles))
                              if projectRoles.nonEmpty || globalRoles.contains(GlobalRole.Administrator) =>
                            checkProjectExistenceBeforeUpdating(
                              db,
                              workspaceId,
                              activityId,
                              oldActivity.projectId,
                              newActivityData,
                              oldActivity
                            )
                          case Some((_, projectRoles)) if projectRoles.nonEmpty =>
                            checkProjectExistenceBeforeUpdating(
                              db,
                              workspaceId,
                              activityId,
                              oldActivity.projectId,
                              newActivityData,
                              oldActivity
                            )
                          case _                                                => Future(Left(Forbidden, "Forbidden or workspace not found."))
                        }
                      else Future(Left(Forbidden, "Forbidden or workspace not found."))
                    // Note: sample patch without changing userId or projectId
                    case (None, None)                                    =>
                      update(db, workspaceId, activityId, newActivityData, oldActivity.projectId, oldActivity)
                    case _                                               =>
                      Future(Left(NotFound, "Not found."))
                  }
                else Future(Left(Forbidden, "You cannot affect an activity to an inactive user."))
              case None       =>
                if (connectedUserGlobalRoles.contains(GlobalRole.Administrator)) Future(Left(NotFound, "Not found."))
                else Future(Left(Forbidden, "Forbidden or workspace not found."))
            }
        case None                        =>
          Future(Left(NotFound, "Not found."))

      }

  def checkProjectExistenceBeforeUpdating(
      db: Databases,
      workspaceId: Int,
      activityId: Int,
      projectId: Int,
      newActivityData: PatchActivity,
      oldActivityData: Activity
  ): Future[Either[(StatusCode, String), Activity]] =
    db.engine
      .run(projects.filter(p => p.workspaceId === workspaceId && !p.isDeleted && p.id === projectId).result.headOption)
      .flatMap {
        case Some(_) =>
          update(db, workspaceId, activityId, newActivityData, projectId, oldActivityData)
        case None    => Future(Left(NotFound, "Not found."))
      }

  def update(
      db: Databases,
      workspaceId: Int,
      activityId: Int,
      newActivityData: PatchActivity,
      patchProjectId: Int,
      oldActivityData: Activity
  ): Future[Either[(StatusCode, String), Activity]] = db.engine
    .run(
      activities
        .filter(_.id === activityId)
        .map(ac => (ac.userId, ac.projectId, ac.description, ac.start, ac.end))
        .update(
          newActivityData.userId.getOrElse(oldActivityData.userId),
          newActivityData.projectId.getOrElse(patchProjectId),
          newActivityData.description.getOrElse(oldActivityData.description),
          newActivityData.start.fold(oldActivityData.start)(_.toEpochMilli),
          newActivityData.end.fold(oldActivityData.end)(e => Some(e.toEpochMilli))
        )
    )
    .flatMap(_ =>
      getActivityById(db, workspaceId, activityId).map {
        case Some(activity: Activity) => Right(activity)
        case _                        => Left(UnprocessableEntity, "Unable to update the activity.")
      }
    )

  def getActivityById(db: Databases, workspaceId: Int, activityId: Int): Future[Option[Activity]] =
    db.engine
      .run(activities.filter(a => a.id === activityId && a.workspaceId === workspaceId).result.headOption)
      .recover { case e: Throwable =>
        log.error(s"Failed to find activity with id $activityId:\n ${e.getMessage}")
        None
      }

  def delete(db: Databases, workspaceId: Int, activityId: Int): Future[(StatusCode, String)] =
    db.engine
      .run(activities.filter(ac => ac.id === activityId && ac.workspaceId === workspaceId).result.headOption)
      .flatMap {
        case Some(_) =>
          db.engine
            .run(activities.filter(ac => ac.id === activityId && ac.workspaceId === workspaceId).delete)
            .map(_ => NoContent -> "The activity was successfully deleted.")
        case _       => Future(Forbidden -> "Forbidden or workspace not found.")
      }

  def createNotification(
      db: Databases,
      newNotification: Notification
  ): Future[Either[(StatusCode, String), Notification]] =
    db.engine
      .run(
        users
          .filter(u => u.workspaceId === newNotification.workspaceId && u.id === newNotification.notifiedUser)
          .result
          .headOption
      )
      .flatMap {
        case Some(_) =>
          val insertAction = notifications += newNotification
          db.engine.run(insertAction).map(_ => Right(newNotification)).recover { case e: Throwable =>
            log.error(s"Failed to insert notification: ${e.getMessage}")
            Left(InternalServerError -> "Internal Server Error")
          }
        case None    =>
          Future.successful(Left(NotFound -> "User does not exist"))
      }
      .recover { case e: Throwable =>
        log.error(
          s"Failed to find user with id ${newNotification.notifiedUser} to create notification:\n${e.getMessage}"
        )
        Left(InternalServerError -> "Internal Server Error")
      }
}
