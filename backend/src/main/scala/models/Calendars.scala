package models

import api.enumeration.GlobalRole
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.{Conflict, Forbidden, NotFound}
import api.generated.calendars.{PatchCalendar, PostCalendar}
import db.Schema
import db.{Calendar, Databases}
import utils.ClassLogging
import utils.DefaultValues._

import scala.concurrent.ExecutionContext.global
import scala.concurrent.{ExecutionContextExecutor, Future}

object Calendars extends Schema with ClassLogging {
  import config.profile.api._
  given ec: ExecutionContextExecutor = global

  def get(db: Databases, workspaceId: Int, calendarId: Int): Future[Option[Calendar]] =
    db.engine.run(calendars.filter(c => c.id === calendarId && c.workspaceId === workspaceId).result.headOption)

  def getUserProjectsCalendars(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      isPrivate: Option[Boolean]
  ): Future[Seq[Calendar]] = {
    val userProjectsFuture = ProjectUsers.getUserProjects(db, workspaceId, userId)
    for {
      userProjects     <- userProjectsFuture
      projectCalendars <- getCalendarsByProjectIds(db, workspaceId, userProjects.map(_.projectId), isPrivate, userId)
    } yield projectCalendars
  }

  private def getCalendarsByProjectIds(
      db: Databases,
      workspaceId: Int,
      projectIds: Seq[Int],
      isPrivate: Option[Boolean],
      userId: Int
  ): Future[Seq[Calendar]] =
    isPrivate match {
      case Some(true)  =>
        readPrivateProjectCalendars(db, workspaceId, projectIds, userId)
      case Some(false) =>
        readPublicProjectCalendars(db, workspaceId, projectIds)
      case _           =>
        readPrivateProjectCalendars(db, workspaceId, projectIds, userId)
          .zip(readPublicProjectCalendars(db, workspaceId, projectIds))
          .map { case (privateProjectCalendars, publicProjectCalendars) =>
            privateProjectCalendars ++ publicProjectCalendars
          }
    }

  private def readPrivateProjectCalendars(
      db: Databases,
      workspaceId: Int,
      projectIds: Seq[Int],
      userId: Int
  ): Future[Seq[Calendar]] = db.engine.run(
    calendars
      .filter(c =>
        (c.workspaceId === workspaceId) && ((c.projectId inSet projectIds) || (!c.projectId.isDefined)) && (c.userId === userId) && (c.isPrivate === true)
      )
      .result
  )

  private def readPublicProjectCalendars(
      db: Databases,
      workspaceId: Int,
      projectIds: Seq[Int]
  ): Future[Seq[Calendar]] = db.engine.run(
    calendars
      .filter(c =>
        (c.workspaceId === workspaceId) && ((c.projectId inSet projectIds) || (!c.projectId.isDefined)) && (c.isPrivate === false)
      )
      .result
  )

  def readPrivateCalendars(
      db: Databases,
      workspaceId: Int,
      connectedUserId: Int
  ): Future[Seq[Calendar]] =
    db.engine
      .run(
        calendars
          .filter(c => c.workspaceId === workspaceId && c.userId === connectedUserId && c.isPrivate === true)
          .result
      )
      .recover { case e: Throwable =>
        log.error(s"Failed to read the private calendars in the workspace $workspaceId:\n ${e.getMessage}")
        Seq.empty[Calendar]
      }

  def readPublicCalendars(db: Databases, workspaceId: Int): Future[Seq[Calendar]] =
    db.engine
      .run(
        calendars.filter(c => c.workspaceId === workspaceId && c.isPrivate === false).result
      )
      .recover { case e: Throwable =>
        log.error(s"Failed to read the public calendars in the workspace $workspaceId:\n ${e.getMessage}")
        Seq.empty[Calendar]
      }

  def getGlobalCalendars(
      db: Databases,
      workspaceId: Int,
      isPrivate: Option[Boolean],
      connectedUserId: Int
  ): Future[Seq[Calendar]] =
    Users.getRoles(db, workspaceId, connectedUserId, None).flatMap {
      case Some((gRoles, _)) =>
        isPrivate match {
          case Some(true) if gRoles.contains(GlobalRole.Administrator)  =>
            readPrivateCalendars(db, workspaceId, connectedUserId)
          case Some(false) if gRoles.contains(GlobalRole.Administrator) =>
            readPublicCalendars(db, workspaceId)
          case _                                                        =>
            if (gRoles.contains(GlobalRole.Administrator)) {
              readPrivateCalendars(db, workspaceId, connectedUserId).zip(readPublicCalendars(db, workspaceId)).map {
                case (privateCalendars, publicCalendars) => privateCalendars ++ publicCalendars
              }
            } else getUserProjectsCalendars(db, workspaceId, connectedUserId, isPrivate)
        }
      case _                 => db.engine.run(calendars.filter(_.workspaceId === workspaceId).result)
    }

  def getProjectCalendars(
      db: Databases,
      workspaceId: Int,
      isPrivate: Option[Boolean],
      projectId: Int,
      connectedUserId: Int
  ): Future[StatusCode Either Seq[Calendar]] = {
    def readCalendars(): Future[Seq[Calendar]] =
      isPrivate match {
        case Some(true)  =>
          db.engine.run(
            calendars
              .filter(c =>
                c.workspaceId === workspaceId && c.projectId === projectId && c.isPrivate === isPrivate && c.userId === connectedUserId
              )
              .result
          )
        case Some(false) =>
          db.engine.run(
            calendars
              .filter(c => c.workspaceId === workspaceId && c.isPrivate === isPrivate && c.projectId === projectId)
              .result
          )
        case _           =>
          db.engine
            .run(
              calendars
                .filter(c =>
                  c.workspaceId === workspaceId && c.projectId === projectId && c.isPrivate === true && c.userId === connectedUserId
                )
                .result
            )
            .zip(
              db.engine.run(
                calendars
                  .filter(c => c.workspaceId === workspaceId && c.isPrivate === false && c.projectId === projectId)
                  .result
              )
            )
            .map { case (privateProjectCalendars, publicProjectCalendars) =>
              privateProjectCalendars ++ publicProjectCalendars
            }
      }

    Users.getRoles(db, workspaceId, connectedUserId, None).flatMap {
      case Some((gRoles, _)) =>
        db.engine
          .run(projects.filter(p => p.workspaceId === workspaceId && p.id === projectId).result.headOption)
          .flatMap {
            case None    =>
              if (gRoles.contains(GlobalRole.Administrator)) Future.successful(Left(NotFound))
              else Future.successful(Left(Forbidden))
            case Some(_) => readCalendars().map(Right(_))
          }
      case None              =>
        Future.successful(Left(Forbidden)) // or any other appropriate action
    }

  }

  def create(
      db: Databases,
      workspaceId: Int,
      newCalendar: PostCalendar,
      projectId: Option[Int],
      connectedUserId: Int
  ): Future[StatusCode Either Calendar] =
    Users.getRoles(db, workspaceId, connectedUserId, None).flatMap {
      case Some((gRoles, _)) =>
        projectId.fold(
          newCalendar.isPrivate match {
            case Some(true) =>
              checkPrivateOrPublicCalendars(db, workspaceId, None, newCalendar, connectedUserId)
            case _          =>
              if (gRoles.contains(GlobalRole.Administrator))
                checkPrivateOrPublicCalendars(db, workspaceId, None, newCalendar, connectedUserId)
              else
                checkPublicProjectCalendars(db, workspaceId, None, newCalendar, connectedUserId)
          }
        ) { id =>
          db.engine.run(projects.filter(p => p.workspaceId === workspaceId && p.id === id).result.headOption).flatMap {
            case None => Future(Left(NotFound))
            case _    =>
              newCalendar.isPrivate match {
                case Some(true) =>
                  checkPrivateOrPublicCalendars(db, workspaceId, projectId, newCalendar, connectedUserId)
                case _          =>
                  if (gRoles.contains(GlobalRole.Administrator))
                    checkPrivateOrPublicCalendars(db, workspaceId, projectId, newCalendar, connectedUserId)
                  else
                    checkPublicProjectCalendars(db, workspaceId, projectId, newCalendar, connectedUserId)
              }
          }
        }
      case _                 =>
        Future(Left(Forbidden))
    }

  private def checkPrivateOrPublicCalendars(
      db: Databases,
      workspaceId: Int,
      projectId: Option[Int],
      newCalendar: PostCalendar,
      connectedUserId: Int
  ): Future[StatusCode Either Calendar] =
    newCalendar.isPrivate match {
      case Some(true) =>
        db.engine
          .run(
            calendars
              .filter(c =>
                c.workspaceId === workspaceId && c.userId === connectedUserId && c.isPrivate === true && c.name === newCalendar.name
              )
              .result
              .headOption
          )
          .flatMap {
            case Some(_) =>
              Future(Left(Conflict))
            case _       =>
              insertCalendar(db, workspaceId, projectId, newCalendar, connectedUserId)
          }
      case _          =>
        db.engine
          .run(
            calendars
              .filter(c => c.workspaceId === workspaceId && c.name === newCalendar.name && c.isPrivate === false)
              .result
              .headOption
          )
          .flatMap {
            case Some(_) =>
              Future(Left(Conflict))
            case _       =>
              insertCalendar(db, workspaceId, projectId, newCalendar, connectedUserId)
          }
    }

  private def checkPublicProjectCalendars(
      db: Databases,
      workspaceId: Int,
      projectId: Option[Int],
      newCalendar: PostCalendar,
      connectedUserId: Int
  ): Future[StatusCode Either Calendar] =
    getUserProjectsCalendars(
      db,
      workspaceId,
      connectedUserId,
      newCalendar.isPrivate
    ).flatMap { case projectCalendars: Seq[Calendar] =>
      if (projectCalendars.map(_.name).contains(newCalendar.name)) Future(Left(Conflict))
      else insertCalendar(db, workspaceId, projectId, newCalendar, connectedUserId)
    // case _                               => Future(Left(Forbidden))
    }

  private def insertCalendar(
      db: Databases,
      workspaceId: Int,
      projectId: Option[Int],
      newCalendar: PostCalendar,
      connectedUserId: Int
  ): Future[StatusCode Either Calendar] = {
    val insertQuery = (
      calendars.map(c =>
        (c.workspaceId, c.name, c.projectId, c.description, c.isPrivate, c.userId, c.timeZone)
      ) returning calendars.map(_.id)
    ) += (workspaceId, newCalendar.name, projectId, newCalendar.description.getOrElse(
      defaultDescription
    ), newCalendar.isPrivate.getOrElse(false),
    connectedUserId,
    newCalendar.timeZone.getOrElse(defaultTimeZone))

    db.engine
      .run(insertQuery)
      .flatMap(id =>
        db.engine.run(calendars.filter(_.id === id).result.headOption.map {
          case None                     => Left(NotFound)
          case Some(calendar: Calendar) => Right(calendar)
        })
      )
  }

  def calendarConnectedUserHasProjectRole(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      connectedUserId: Int
  ): Future[Boolean] =
    db.engine
      .run(
        (for {
          cal <- calendars.filter(c => c.id === calendarId && c.workspaceId === workspaceId)
          p   <- projectUsers.filter(p => p.projectId === cal.projectId && p.userId === connectedUserId)
        } yield p.member || p.lead || p.supervisor).result
      )
      .map(_.contains(true))

  def calendarUserHasProjectRole(
      db: Databases,
      workspaceId: Int,
      calendar: Calendar,
      projectId: Option[Int]
  ): Future[Boolean] =
    db.engine
      .run(
        (for {
          p <- projectUsers.filter(p =>
                 p.workspaceId === workspaceId && p.projectId === projectId && p.userId === calendar.userId
               )
        } yield p.member || p.lead || p.supervisor).result
      )
      .map(_.contains(true))

  def patch(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      globalRoles: Set[GlobalRole],
      calendarForUpdate: PatchCalendar,
      oldCalendarInfo: Calendar,
      connectedUserId: Int
  ): Future[(StatusCode, String) Either Calendar] =
    projectId.fold(
      checkCalendarsForPatch(
        db,
        workspaceId,
        calendarId,
        projectId,
        oldCalendarInfo,
        calendarForUpdate,
        connectedUserId
      )
    ) { id =>
      db.engine.run(projects.filter(p => p.workspaceId === workspaceId && p.id === id).result.headOption).flatMap {
        case Some(_)                                             =>
          checkCalendarsForPatch(
            db,
            workspaceId,
            calendarId,
            projectId,
            oldCalendarInfo,
            calendarForUpdate,
            connectedUserId
          )
        case _ if globalRoles.contains(GlobalRole.Administrator) =>
          Future(Left(NotFound, "Calendar or project not found."))
        case _                                                   => Future(Left(Forbidden, "Forbidden or workspace not found."))
      }
    }

  private def checkCalendarsForPatch(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      oldCalendarInfo: Calendar,
      patch: PatchCalendar,
      connectedUserId: Int
  ): Future[(StatusCode, String) Either Calendar] =
    Users.getRoles(db, workspaceId, connectedUserId, None).flatMap {
      case Some((gRoles, _)) =>
        if (gRoles.contains(GlobalRole.Administrator))
          checkAndUpdatePublicOrPrivateCalendars(
            db,
            workspaceId,
            calendarId,
            projectId,
            patch,
            oldCalendarInfo,
            connectedUserId
          )
        else
          patch.isPrivate match {
            case Some(true)  =>
              checkAndUpdatePublicOrPrivateCalendars(
                db,
                workspaceId,
                calendarId,
                projectId,
                patch,
                oldCalendarInfo,
                connectedUserId
              )
            case Some(false) =>
              checkAndUpdatePublicProjectCalendars(
                db,
                workspaceId,
                calendarId,
                projectId,
                patch,
                oldCalendarInfo,
                connectedUserId
              )
            case _           =>
              if (oldCalendarInfo.isPrivate)
                checkAndUpdatePublicOrPrivateCalendars(
                  db,
                  workspaceId,
                  calendarId,
                  projectId,
                  patch,
                  oldCalendarInfo,
                  connectedUserId
                )
              else
                checkAndUpdatePublicProjectCalendars(
                  db,
                  workspaceId,
                  calendarId,
                  projectId,
                  patch,
                  oldCalendarInfo,
                  connectedUserId
                )
          }
      case _                 => Future(Left(NotFound, "Calendar or project not found."))
    }

  private def checkEventsExistence(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      calendarForPatch: PatchCalendar,
      oldCalendarInfo: Calendar,
      connectedUserId: Int,
      calendarName: String
  ): Future[(StatusCode, String) Either Calendar] =
    db.engine
      .run(
        events
          .filter(e => e.workspaceId === workspaceId && e.calendarId === calendarId && e.creator =!= connectedUserId)
          .result
          .headOption
      )
      .flatMap {
        case Some(_) =>
          Future(
            Left(
              Forbidden,
              "You cannot move this calendar from public to private: There are foreign events attached to this calendar."
            )
          )
        case _       =>
          filterPrivateCalendars(
            db,
            workspaceId,
            calendarId,
            projectId,
            calendarForPatch,
            oldCalendarInfo,
            connectedUserId,
            calendarName
          )
      }

  private def checkAndUpdatePublicOrPrivateCalendars(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      calendarForPatch: PatchCalendar,
      oldCalendarInfo: Calendar,
      connectedUserId: Int
  ): Future[(StatusCode, String) Either Calendar] = {
    val calendarName = calendarForPatch.name.getOrElse(oldCalendarInfo.name)
    calendarForPatch.isPrivate match {
      case Some(true)  =>
        checkEventsExistence(
          db,
          workspaceId,
          calendarId,
          projectId,
          calendarForPatch,
          oldCalendarInfo,
          connectedUserId,
          calendarName
        )
      case Some(false) =>
        filterPublicCalendars(
          db,
          workspaceId,
          calendarId,
          projectId,
          calendarForPatch,
          oldCalendarInfo,
          calendarName
        )
      case _           =>
        if (oldCalendarInfo.isPrivate) {
          filterPrivateCalendars(
            db,
            workspaceId,
            calendarId,
            projectId,
            calendarForPatch,
            oldCalendarInfo,
            connectedUserId,
            calendarName
          )
        } else {
          filterPublicCalendars(
            db,
            workspaceId,
            calendarId,
            projectId,
            calendarForPatch,
            oldCalendarInfo,
            calendarName
          )
        }
    }
  }

  private def checkAndUpdatePublicProjectCalendars(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      calendarForPatch: PatchCalendar,
      oldCalendarInfo: Calendar,
      connectedUserId: Int
  ): Future[(StatusCode, String) Either Calendar] =
    getUserProjectsCalendars(
      db,
      workspaceId,
      connectedUserId,
      calendarForPatch.isPrivate
    ).flatMap { case projectCalendars: Seq[Calendar] =>
      val updatedName: String = calendarForPatch.name.getOrElse(oldCalendarInfo.name)
      if (projectCalendars.map(_.name).contains(updatedName) && updatedName != oldCalendarInfo.name)
        Future(Left(Conflict, "Unable to update calendar (There is another calendar with the same name)."))
      else updateCalendar(db, workspaceId, calendarId, projectId, oldCalendarInfo, calendarForPatch)
    // case _ => Future(Left(Forbidden, "Forbidden or workspace not found."))
    }

  private def filterPrivateCalendars(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      calendarForPatch: PatchCalendar,
      oldCalendarInfo: Calendar,
      connectedUserId: Int,
      calendarName: String
  ): Future[(StatusCode, String) Either Calendar] =
    db.engine
      .run(
        calendars
          .filter(c =>
            c.workspaceId === workspaceId && c.userId === connectedUserId && c.isPrivate === true && c.name === calendarName && c.id =!= calendarId
          )
          .result
          .headOption
      )
      .flatMap {
        case Some(_) =>
          Future(Left(Conflict, "Unable to update calendar (There is another calendar with the same name)."))
        case _       => updateCalendar(db, workspaceId, calendarId, projectId, oldCalendarInfo, calendarForPatch)
      }

  private def filterPublicCalendars(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      calendarForPatch: PatchCalendar,
      oldCalendarInfo: Calendar,
      calendarName: String
  ): Future[(StatusCode, String) Either Calendar] =
    db.engine
      .run(
        calendars
          .filter(c =>
            c.workspaceId === workspaceId && c.name === calendarName && c.isPrivate === false && c.id =!= calendarId
          )
          .result
          .headOption
      )
      .flatMap {
        case Some(_) =>
          Future(Left(Conflict, "Unable to update calendar (There is another calendar with the same name)."))
        case _       =>
          updateCalendar(db, workspaceId, calendarId, projectId, oldCalendarInfo, calendarForPatch)
      }

  private def updateCalendar(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      currentCalendar: Calendar,
      patch: PatchCalendar
  ): Future[(StatusCode, String) Either Calendar] =
    db.engine
      .run(
        calendars
          .filter(_.id === calendarId)
          .map(c => (c.name, c.projectId, c.isPrivate, c.description, c.timeZone))
          .update(
            patch.name.getOrElse(currentCalendar.name),
            projectId.fold(currentCalendar.projectId)(_ => projectId),
            patch.isPrivate.getOrElse(currentCalendar.isPrivate),
            patch.description.getOrElse(currentCalendar.description),
            patch.timeZone.getOrElse(currentCalendar.timeZone)
          )
      )
      .flatMap(_ =>
        get(db, workspaceId, calendarId).map {
          case Some(calendar: Calendar) => Right(calendar)
          case _                        => Left(Forbidden, "Forbidden or workspace not found.")
        }
      )

  def delete(db: Databases, workspaceId: Int, calendarId: Int): Future[StatusCode Either Int] =
    db.engine
      .run(calendars.filter(c => c.id === calendarId && c.workspaceId === workspaceId).result.headOption)
      .flatMap {
        case None => Future(Left(Forbidden))
        case _    =>
          db.engine
            .run(calendars.filter(c => c.id === calendarId && c.workspaceId === workspaceId).delete)
            .map(_ => Right(1))
      }
}
