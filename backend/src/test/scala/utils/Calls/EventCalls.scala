package utils.Calls

import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.events.{Event, PatchEvent, PostEvent}
import utils.HttpClient

trait EventCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String = "http://localhost:9000"

  private def eventRoute(workspaceId: Int, eventId: Int) =
    s"$route/api/workspaces/$workspaceId/events/$eventId"

  private def eventsRoute(workspaceId: Int) =
    s"$route/api/workspaces/$workspaceId/events"

  def getEvent(workspaceId: Int, eventId: Int)(using token: String): Result[Event] =
    response(HttpMethods.GET, eventRoute(workspaceId, eventId), Option(token)).decoded[Event]

  def getEvents(workspaceId: Int, calendarId: Option[Int] = None, isPrivate: Option[Boolean] = Some(false))(using
      token: String
  ): Result[List[Event]] =
    response(
      HttpMethods.GET,
      eventsRoute(workspaceId) + qParams(true, "calendarId" -> calendarId, "isPrivate" -> isPrivate),
      Option(token)
    ).decoded[List[Event]]

  def getEventById(workspaceId: Int, eventId: Int)(using token: String): Result[Event] =
    response(HttpMethods.GET, eventRoute(workspaceId, eventId), Option(token)).decoded[Event]

  def postEvent(workspaceId: Int, event: PostEvent)(using token: String): Result[Event] =
    response(HttpMethods.POST, eventsRoute(workspaceId), event, Option(token)).decoded[Event]

  def patchEvent(workspaceId: Int, eventId: Int, event: PatchEvent)(using token: String): Result[Event] =
    response(HttpMethods.PATCH, eventRoute(workspaceId, eventId), event, Option(token)).decoded[Event]

  def deleteEvent(workspaceId: Int, eventId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, eventRoute(workspaceId, eventId), Option(token)).raw
}
