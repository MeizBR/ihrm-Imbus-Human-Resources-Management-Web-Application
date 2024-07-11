package controllers

import api.enumeration.GlobalRole
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.events.{PatchEvent, PostEvent}
import db._
import utils.pekkohttpcirce.FailFastCirceSupport._
import models.Events
import utils.RestErrorFactory.Failure
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import io.circe.generic.auto._
import io.circe.syntax._
object EventsHandler {
  private given ec: ExecutionContextExecutor                 = global
  given eventsOrdering: Ordering[api.generated.events.Event] = Ordering by { (e: api.generated.events.Event) =>
    (e.start, e.id)
  }
  def createEvent(
      db: Databases,
      workspaceId: Int,
      newEvent: PostEvent,
      globalRoles: Set[GlobalRole],
      connectedUserId: Int
  ): Route =
    complete(
      Events.create(db, workspaceId, newEvent, globalRoles, connectedUserId).map[ToResponseMarshallable] {
        case Right(event)     => StatusCodes.Created -> event.toRest
        case Left(statusCode) => statusCode._1       -> Failure(statusCode._2)
      }
    )

  def readEvents(
      db: Databases,
      workspaceId: Int,
      connectedUserId: Int,
      calendarId: Option[Int],
      isPrivateCalendar: Option[Boolean]
  ): Route = complete(
    Events
      .getAll(db, workspaceId, connectedUserId, calendarId, isPrivateCalendar)
      .map[ToResponseMarshallable](_.map(_.toRest).sorted.reverse.asJson)
  )

  def readEvent(db: Databases, workspaceId: Int, connectedUserId: Int, eventId: Int): Route = complete(
    Events.getById(db, workspaceId, connectedUserId, eventId).map[ToResponseMarshallable] {
      case Right(event)                            => StatusCodes.OK       -> event.map(_.toRest)
      case Left(forbidden @ StatusCodes.Forbidden) => forbidden            -> Failure("Forbidden or workspace not found.")
      case _                                       => StatusCodes.NotFound -> Failure("Not found.")
    }
  )

  def updateEvent(
      db: Databases,
      workspaceId: Int,
      eventId: Int,
      patchEvent: PatchEvent,
      connectedUserId: Int,
      globalRoles: Set[GlobalRole],
      isPrivatePatchCalendar: Boolean
  ): Route =
    complete(
      Events
        .patch(db, workspaceId, eventId, patchEvent, connectedUserId, globalRoles, isPrivatePatchCalendar)
        .map[ToResponseMarshallable] {
          case Right(event)     => StatusCodes.OK -> event.toRest
          case Left(statusCode) => statusCode._1  -> Failure(statusCode._2)
        }
    )

  def deleteEvent(db: Databases, workspaceId: Int, eventId: Int): Route = complete(
    Events.delete(db, workspaceId, eventId).map[ToResponseMarshallable] { case (status, failure) =>
      status -> failure
    }
  )
}
