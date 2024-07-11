package utils.Calls

import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.calendars.{Calendar, PatchCalendar, PostCalendar}
import utils.HttpClient

trait CalendarCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String = "http://localhost:9000"

  private def calendarRoute(workspaceId: Int, calendarId: Int) =
    s"$route/api/workspaces/$workspaceId/calendar/$calendarId"

  private def calendarRoute(workspaceId: Int) =
    s"$route/api/workspaces/$workspaceId/calendar"

  private def calendarsRoute(workspaceId: Int) =
    s"$route/api/workspaces/$workspaceId/calendars"

  private def projectsRoute(workspaceId: Int) = s"$route/api/workspaces/$workspaceId/projects"

  private def projectRoute(workspaceId: Int, projectId: Int) = s"${projectsRoute(workspaceId)}/$projectId"

  def getCalendar(workspaceId: Int, calendarId: Int)(using token: String): Result[Calendar] =
    response(HttpMethods.GET, calendarRoute(workspaceId, calendarId), Option(token)).decoded[Calendar]

  def getCalendars(workspaceId: Int, projectId: Option[Int] = None, isPrivate: Option[Boolean] = Some(false))(using
      token: String
  ): Result[List[Calendar]] =
    response(
      HttpMethods.GET,
      calendarsRoute(workspaceId) + qParams(true, "projectId" -> projectId, "isPrivate" -> isPrivate),
      Option(token)
    ).decoded[List[Calendar]]

  def postCalendar(workspaceId: Int, calendar: PostCalendar, projectId: Option[Int] = None)(using
      token: String
  ): Result[Calendar] =
    response(
      HttpMethods.POST,
      calendarRoute(workspaceId) + qParams(true, "projectId" -> projectId),
      calendar,
      Option(token)
    ).decoded[Calendar]

  def patchCalendar(workspaceId: Int, calendarId: Int, patch: PatchCalendar)(using token: String): Result[Calendar] =
    response(HttpMethods.PATCH, calendarRoute(workspaceId, calendarId), patch, Option(token)).decoded[Calendar]

  def deleteCalendar(workspaceId: Int, calendarId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, calendarRoute(workspaceId, calendarId), Option(token)).raw
}
