package controllers

import api.enumeration.GlobalRole
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.calendars.{PatchCalendar, PostCalendar}
import db._
import utils.pekkohttpcirce.FailFastCirceSupport._
import models.Calendars
import utils.RestErrorFactory.Failure
import scala.concurrent.ExecutionContext.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContextExecutor}
import io.circe.generic.auto.*
import io.circe.syntax.*
object CalendarsHandler {
  private given ec: ExecutionContextExecutor                                = global
  given calendarOrdering: Ordering[api.generated.calendars.Calendar]        = Ordering by {
    (c: api.generated.calendars.Calendar) =>
      (c.name, c.isPrivate, c.id)
  }
  def readCalendar(db: Databases, workspaceId: Int, calendarId: Int): Route = complete(
    Calendars.get(db, workspaceId, calendarId).map[ToResponseMarshallable](_.map(_.toRest))
  )

  def readCalendarDetails(db: Databases, workspaceId: Int, calendarId: Int, globalRoles: Set[GlobalRole])(
      checkRole: Calendar => Route
  ): Route =
    Await.result(
      Calendars.get(db, workspaceId, calendarId),
      Duration.Inf
    ) match {
      case Some(calendar)                                      => checkRole(calendar)
      case _ if globalRoles.contains(GlobalRole.Administrator) =>
        complete(StatusCodes.NotFound -> Failure("Calendar not found."))
      case _                                                   => complete(StatusCodes.Forbidden -> Failure("Forbidden or workspace not found."))
    }

  def isAPublicCalendar(calendar: Calendar): Boolean                   = !calendar.isPrivate
  def calendarOwner(calendar: Calendar, userId: Int): Boolean          = calendar.userId == userId
  def isGlobalCalendar(calendar: Calendar): Boolean                    = calendar.projectId.isEmpty
  def adminPatchCondition(isPrivateCalendar: Option[Boolean]): Boolean =
    isPrivateCalendar.isEmpty

  def readGlobalCalendars(
      db: Databases,
      workspaceId: Int,
      isPrivate: Option[Boolean],
      connectedUserId: Int
  ): Route =
    complete(
      Calendars
        .getGlobalCalendars(db, workspaceId, isPrivate, connectedUserId)
        .map[ToResponseMarshallable](_.map(_.toRest).sorted.reverse.asJson)
    )

  def readProjectCalendars(
      db: Databases,
      workspaceId: Int,
      projectId: Int,
      isPrivate: Option[Boolean],
      connectedUserId: Int
  ): Route =
    complete(
      Calendars
        .getProjectCalendars(db, workspaceId, isPrivate, projectId, connectedUserId)
        .map[ToResponseMarshallable] {
          case Right(calendars)                      => StatusCodes.OK        -> calendars.map(_.toRest).sorted
          case Left(notFound @ StatusCodes.NotFound) => notFound              -> Failure("Calendar Not found.")
          case _                                     => StatusCodes.Forbidden -> Failure("Forbidden or workspace not found.")
        }
    )
  def createCalendar(
      db: Databases,
      workspaceId: Int,
      newCalendar: PostCalendar,
      projectId: Option[Int] = None,
      connectedUserId: Int
  ): Route =
    complete(Calendars.create(db, workspaceId, newCalendar, projectId, connectedUserId).map[ToResponseMarshallable] {
      case Right(calendar)                => StatusCodes.Created  -> calendar.toRest
      case Left(e @ StatusCodes.Conflict) =>
        e -> Failure("Unable to create calendar (There is another calendar with the same name).")
      case _                              => StatusCodes.NotFound -> Failure("Project not found or calendar can not be inserted.")
    })

  def updateCalendar(
      db: Databases,
      workspaceId: Int,
      calendarId: Int,
      globalRoles: Set[GlobalRole],
      calendarForUpdate: PatchCalendar,
      oldCalendarInfo: Calendar,
      connectedUserId: Int
  ): Route = complete(
    Calendars
      .patch(
        db,
        workspaceId,
        calendarId,
        calendarForUpdate.projectId,
        globalRoles,
        calendarForUpdate,
        oldCalendarInfo,
        connectedUserId
      )
      .map[ToResponseMarshallable] {
        case Right(calendar: Calendar) => StatusCodes.OK -> calendar.toRest
        case Left(statusCode)          => statusCode._1  -> Failure(statusCode._2)
      }
  )

  def deleteCalendar(db: Databases, workspaceId: Int, calendarId: Int): Route = complete(
    Calendars.delete(db, workspaceId, calendarId).map[ToResponseMarshallable] {
      case Left(e @ StatusCodes.Forbidden) =>
        e -> Failure("Forbidden or workspace not found.")
      case _                               => StatusCodes.NoContent
    }
  )
}
