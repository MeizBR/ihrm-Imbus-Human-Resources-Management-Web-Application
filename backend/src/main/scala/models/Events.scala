package models

import api.enumeration.{EventType, GlobalRole, Repetitive}
import api.generated.events.{PatchEvent, PostEvent}
import db.{Calendar, Databases, Event, Schema}
import models.Calendars.{getUserProjectsCalendars, readPrivateCalendars, readPublicCalendars}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.*
import utils.ClassLogging
import utils.DefaultValues.*
import utils.RestErrorFactory.Failure

import java.time.temporal.ChronoUnit
import java.time.{Instant, ZoneOffset}
import scala.concurrent.ExecutionContext.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContextExecutor, Future}

object Events extends Schema with ClassLogging {

  import config.profile.api.*

  given ec: ExecutionContextExecutor = global

  def get(db: Databases, workspaceId: Int, eventId: Int): Future[Option[Event]] =
    db.engine.run(events.filter(e => e.id === eventId && e.workspaceId === workspaceId).result.headOption)

  def getById(
      db: Databases,
      workspaceId: Int,
      connectedUserId: Int,
      eventId: Int
  ): Future[Either[StatusCode, Option[Event]]] =
    Users.getRoles(db, workspaceId, connectedUserId, None).flatMap {
      case Some((gRoles, _)) =>
        db.engine.run(events.filter(e => e.id === eventId && e.workspaceId === workspaceId).result.headOption).flatMap {
          case None  =>
            if (gRoles.contains(GlobalRole.Administrator)) Future(Left(NotFound))
            else
              Future(Left(Forbidden))
          case event => Future(Right(event))
        }
      case _                 =>
        Future(Left(Forbidden))
    }

  private def getCalendarsInfo(calendarsList: Seq[Calendar]): Seq[(Int, Boolean)] =
    calendarsList.map(c => c.calendarId -> c.isPrivate)

  private def listEvents(
      db: Databases,
      workspaceId: Int,
      isPrivate: Boolean,
      calendarsInfo: Seq[(Int, Boolean)],
      calendarId: Option[Int]
  ): Future[Seq[Event]] = {
    val res = db.engine.run(
      events.filter(_.workspaceId === workspaceId).result
    )
    calendarId.fold(
      res.map(events =>
        events.filter(se => calendarsInfo.exists(ci => ci._1 == se.calendarId && ci._2 == isPrivate)).map { event =>
          Event(
            event.eventId,
            event.workspaceId,
            event.calendarId,
            isPrivate,
            event.start,
            event.end,
            event.title,
            event.description,
            event.repetition,
            event.allDay,
            event.eventType,
            event.creator
          )
        }
      )
    ) { id =>
      res.map(events =>
        events
          .filter(se => calendarsInfo.exists(ci => ci._1 == se.calendarId && ci._2 == isPrivate) && se.calendarId == id)
          .map { event =>
            Event(
              event.eventId,
              event.workspaceId,
              event.calendarId,
              isPrivate,
              event.start,
              event.end,
              event.title,
              event.description,
              event.repetition,
              event.allDay,
              event.eventType,
              event.creator
            )
          }
      )
    }
  }

  def getAll(
      db: Databases,
      workspaceId: Int,
      connectedUserId: Int,
      calendarId: Option[Int],
      isPrivateCalendar: Option[Boolean]
  ): Future[Seq[Event]] =
    Users.getRoles(db, workspaceId, connectedUserId, None).flatMap {
      case Some((gRoles, _)) =>
        isPrivateCalendar match {
          case Some(true)  =>
            readPrivateCalendars(db, workspaceId, connectedUserId).map { (calendarsList: Seq[Calendar]) =>
              val events = listEvents(
                db,
                workspaceId,
                isPrivate = true,
                getCalendarsInfo(calendarsList): Seq[(Int, Boolean)],
                calendarId
              )
              Await.result(events, Duration.Inf)
            }
          case Some(false) =>
            if (gRoles.contains(GlobalRole.Administrator))
              readPublicCalendars(db, workspaceId).map { (calendarsList: Seq[Calendar]) =>
                val events = listEvents(
                  db,
                  workspaceId,
                  isPrivate = false,
                  getCalendarsInfo(calendarsList): Seq[(Int, Boolean)],
                  calendarId
                )
                Await.result(events, Duration.Inf)
              }
            else
              getUserProjectsCalendars(db, workspaceId, connectedUserId, Some(false)).map {
                (calendarsList: Seq[Calendar]) =>
                  val events = listEvents(
                    db,
                    workspaceId,
                    isPrivate = false,
                    getCalendarsInfo(calendarsList): Seq[(Int, Boolean)],
                    calendarId
                  )
                  Await.result(events, Duration.Inf)
              }
          case _           =>
            if (gRoles.contains(GlobalRole.Administrator))
              readPrivateCalendars(db, workspaceId, connectedUserId).zip(readPublicCalendars(db, workspaceId)).map {
                case (privateCalendars: Seq[Calendar], publicCalendars: Seq[Calendar]) =>
                  val calendarsList = privateCalendars ++ publicCalendars
                  val events        =
                    listEvents(
                      db,
                      workspaceId,
                      isPrivate = true,
                      getCalendarsInfo(calendarsList): Seq[(Int, Boolean)],
                      calendarId
                    ).zip(
                      listEvents(
                        db,
                        workspaceId,
                        isPrivate = false,
                        getCalendarsInfo(calendarsList): Seq[(Int, Boolean)],
                        calendarId
                      )
                    ).map { case (privateEvents, publicEvents) =>
                      privateEvents ++ publicEvents
                    }
                  Await.result(events, Duration.Inf)
              }
            else
              readPrivateCalendars(db, workspaceId, connectedUserId)
                .zip(getUserProjectsCalendars(db, workspaceId, connectedUserId, Some(false)))
                .map { case (privateCalendars: Seq[Calendar], publicProjectCalendars: Seq[Calendar]) =>
                  val calendarsList = privateCalendars ++ publicProjectCalendars
                  val events        =
                    listEvents(
                      db,
                      workspaceId,
                      isPrivate = true,
                      getCalendarsInfo(calendarsList): Seq[(Int, Boolean)],
                      calendarId
                    ).zip(
                      listEvents(
                        db,
                        workspaceId,
                        isPrivate = false,
                        getCalendarsInfo(calendarsList): Seq[(Int, Boolean)],
                        calendarId
                      )
                    ).map { case (privateEvents, publicEvents) =>
                      privateEvents ++ publicEvents
                    }
                  Await.result(events, Duration.Inf)
                }
        }
      case _                 => Future(Seq())
    }

  def create(
      db: Databases,
      workspaceId: Int,
      newEvent: PostEvent,
      globalRoles: Set[GlobalRole],
      connectedUserId: Int
  ): Future[(StatusCode, String) Either Event] = {
    lazy val newRepetition = newEvent.repetition.getOrElse(defaultRepetition.toString)
    if (
      !EventType.values.exists(_.toString == newEvent.eventType) || (newRepetition.nonEmpty && !Repetitive.values
        .exists(_.toString == newRepetition))
    )
      Future.successful(Left(UnprocessableEntity, "Invalid enumeration value."))
    else if (newEvent.start.isAfter(newEvent.end))
      Future(Left(UnprocessableEntity, "Start date should be before end date."))
    else {
      db.engine
        .run(
          calendars.filter(c => c.workspaceId === workspaceId && c.id === newEvent.calendarId).result.headOption
        )
        .recover { case e: Throwable =>
          log.error(s"Failed to read calendar with id ${newEvent.calendarId}:\n ${e.getMessage}")
          Future.successful(Left(InternalServerError, "Failed to create event."))
        }
        .flatMap {
          case Some(calendar: Calendar)                            =>
            lazy val startDate: Instant = newEvent.start.truncatedTo(ChronoUnit.DAYS)
            lazy val endDate: Instant   = newEvent.end.truncatedTo(ChronoUnit.DAYS)
            lazy val startDateTiming    = newEvent.start.atZone(ZoneOffset.UTC).toLocalTime
            lazy val entDateTiming      = newEvent.end.atZone(ZoneOffset.UTC).toLocalTime

            if (!newEvent.allDay && startDate == endDate && startDateTiming == entDateTiming) {
              Future(Left(Forbidden, "Start and end times should not be equals."))
            } else {
              insertEvent(db, workspaceId, newEvent, calendar, connectedUserId)
            }
          case _ if globalRoles.contains(GlobalRole.Administrator) => Future(Left(NotFound, "Calendar not found."))
          case _                                                   => Future(Left(Forbidden, "Forbidden or workspace not found."))
        }
    }
  }

  private def insertEvent(
      db: Databases,
      workspaceId: Int,
      newEvent: PostEvent,
      calendar: Calendar,
      connectedUserId: Int
  ): Future[(StatusCode, String) Either Event] = {
    lazy val eventType  = EventType.determineEnumValue(Some(newEvent.eventType), defaultEventType)
    lazy val repetition = Repetitive.determineEnumValue(newEvent.repetition, defaultRepetition)
    val insertQuery     = (events.map(e =>
      (
        e.workspaceId,
        e.calendarId,
        e.isPrivateCalendar,
        e.start,
        e.end,
        e.title,
        e.description,
        e.repetition,
        e.allDay,
        e.eventType,
        e.creator
      )
    ) returning events.map(_.id)) +=
      (
        workspaceId,
        newEvent.calendarId,
        calendar.isPrivate,
        newEvent.start.truncatedTo(ChronoUnit.MINUTES).toEpochMilli,
        newEvent.end.truncatedTo(ChronoUnit.MINUTES).toEpochMilli,
        newEvent.title,
        newEvent.description.getOrElse(defaultDescription),
        repetition.id,
        newEvent.allDay,
        eventType.id,
        connectedUserId
      )
    db.engine.run(insertQuery).flatMap { case id: Int =>
      db.engine.run(events.filter(_.id === id).result.headOption).map {
        case None               => Left(NotFound, "Calendar not found.")
        case Some(event: Event) =>
          log.info("The event successfully created.")
          Right(event)
      }
    }
  }

  def checkEventExists(db: Databases, workspaceId: Int, eventId: Int): Future[Option[Int]] =
    db.engine.run(
      events.filter(e => e.id === eventId && e.workspaceId === workspaceId).map(_.calendarId).result.headOption
    )

  def verifyEventOwner(db: Databases, workspaceId: Int, eventId: Int, userId: Int): Boolean =
    Await.result(Events.get(db, workspaceId, eventId).map(_.map(_.creator).contains(userId)), Duration.Inf)

  def patch(
      db: Databases,
      workspaceId: Int,
      eventId: Int,
      patchEvent: PatchEvent,
      connectedUserId: Int,
      globalRoles: Set[GlobalRole],
      isPrivatePatchCalendar: Boolean
  ): Future[(StatusCode, String) Either Event] =
    db.engine
      .run(events.filter(e => e.workspaceId === workspaceId && e.id === eventId).result.headOption)
      .recover { case e: Throwable =>
        log.error(s"Failed to find an event with id $eventId:\n ${e.getMessage}")
        Future.successful(Left(InternalServerError, s"Failed to patch the event with id $eventId."))
      }
      .flatMap {
        case Some(oldEvent: Event) =>
          lazy val oldRepetition = Repetitive.values.find(_.id == oldEvent.repetition).head
          lazy val oldEventType  = EventType.values.find(_.id == oldEvent.eventType).head
          lazy val newRepetition = patchEvent.repetition.getOrElse(oldRepetition.toString)
          lazy val newEventType  = patchEvent.eventType.getOrElse(oldEventType.toString)
          if (
            (newRepetition.nonEmpty && !Repetitive.values.exists(
              _.toString == newRepetition
            )) || newEventType.nonEmpty && !EventType.values.exists(_.toString == newEventType)
          )
            Future.successful(Left(UnprocessableEntity, "Invalid enumeration value."))
          else
            patchEvent.calendarId.fold[Future[(StatusCode, String) Either Event]](
              checkDatesAndUpdateEvent(db, workspaceId, eventId, patchEvent, oldEvent, globalRoles)
            ) { (_: Int) =>
              if (
                (!oldEvent.isPrivateCalendar && !isPrivatePatchCalendar) || verifyEventOwner(
                  db,
                  workspaceId,
                  eventId,
                  connectedUserId
                )
              )
                checkDatesAndUpdateEvent(db, workspaceId, eventId, patchEvent, oldEvent, globalRoles)
              else
                Future.successful(
                  Left(
                    Forbidden ->
                      "You cannot move this event from a public to a private calendar. You're not the owner."
                  )
                )
            }
        case None                  =>
          if (globalRoles.contains(GlobalRole.Administrator)) Future.successful(Left(NotFound -> "Event not found."))
          else Future.successful(Left(Forbidden -> "Forbidden or workspace not found."))
        case _                     =>
          Future.successful(
            Left(InternalServerError -> "Internal Server Error\", \"There was an internal server error.")
          )
      }

  private def checkDatesAndUpdateEvent(
      db: Databases,
      workspaceId: Int,
      eventId: Int,
      patchEvent: PatchEvent,
      oldEvent: Event,
      globalRoles: Set[GlobalRole]
  ): Future[(StatusCode, String) Either Event] = {
    val start = patchEvent.start.getOrElse(Instant.ofEpochMilli(oldEvent.start))
    val end   = patchEvent.end.getOrElse(Instant.ofEpochMilli(oldEvent.end))
    if (start.isAfter(end)) Future(Left(UnprocessableEntity, "Start date should be before end date."))
    else {
      updateEvent(db, workspaceId, eventId, patchEvent, oldEvent, globalRoles)
    }
  }

  private def updateEvent(
      db: Databases,
      workspaceId: Int,
      eventId: Int,
      patchEvent: PatchEvent,
      oldEvent: Event,
      globalRoles: Set[GlobalRole]
  ): Future[(StatusCode, String) Either Event] =
    patchEvent.calendarId.fold(
      update(db, workspaceId, eventId, patchEvent, oldEvent, oldEvent.isPrivateCalendar)
    ) { (calendarId: Int) =>
      db.engine
        .run(
          calendars.filter(c => c.workspaceId === workspaceId && c.id === calendarId).result.headOption
        )
        .recover { case e: Throwable =>
          log.error(s"Calendar with id $calendarId can not be found when we update an event:\n ${e.getMessage}")
          Future.successful(Left(InternalServerError, "Failed to update event."))
        }
        .flatMap {
          case Some(calendar: Calendar)                            =>
            update(db, workspaceId, eventId, patchEvent, oldEvent, calendar.isPrivate)
          case _ if globalRoles.contains(GlobalRole.Administrator) => Future(Left(NotFound, "Calendar not found."))
          case _                                                   => Future(Left(Forbidden, "Forbidden or workspace not found."))
        }
    }

  private def update(
      db: Databases,
      workspaceId: Int,
      eventId: Int,
      patchEvent: PatchEvent,
      oldEvent: Event,
      isPrivate: Boolean
  ): Future[(StatusCode, String) Either Event] = {
    lazy val newEventType  = EventType.determineEnumValue(patchEvent.eventType, oldEvent.adaptedEventType)
    lazy val newRepetition = Repetitive.determineEnumValue(patchEvent.repetition, oldEvent.adaptedRepetitive)
    db.engine
      .run(
        events
          .filter(e => e.id === eventId && e.workspaceId === workspaceId)
          .map(e =>
            (
              e.calendarId,
              e.isPrivateCalendar,
              e.start,
              e.end,
              e.title,
              e.description,
              e.repetition,
              e.allDay,
              e.eventType
            )
          )
          .update(
            patchEvent.calendarId.getOrElse(oldEvent.calendarId),
            isPrivate,
            patchEvent.start.fold(oldEvent.start)(_.toEpochMilli),
            patchEvent.end.fold(oldEvent.end)(_.toEpochMilli),
            patchEvent.title.getOrElse(oldEvent.title),
            patchEvent.description.getOrElse(oldEvent.description),
            newRepetition.id,
            patchEvent.allDay.getOrElse(oldEvent.allDay),
            newEventType.id
          )
      )
      .recover { case e: Throwable =>
        log.error(s"Failed to update event with id $eventId:\n ${e.getMessage}")
        Future.successful(Left(InternalServerError, "Failed to update event."))
      }
      .flatMap { _ =>
        get(db, workspaceId, eventId).map {
          case Some(event: Event) => Right(event)
          case _                  => Left(Forbidden, "Forbidden or workspace not found.")
        }
      }
  }

  def delete(db: Databases, workspaceId: Int, eventId: Int): Future[(StatusCode, Failure)] =
    db.engine
      .run(events.filter(c => c.id === eventId && c.workspaceId === workspaceId).result.headOption)
      .recover { case e: Throwable =>
        log.error(s"The event with id $eventId to delete could not be found:\n ${e.getMessage}")
        Future.successful(Left(InternalServerError, "Failed to delete event."))
      }
      .flatMap {
        case None => Future(Forbidden -> Failure("Forbidden or workspace not found."))
        case _    =>
          db.engine
            .run(events.filter(c => c.id === eventId && c.workspaceId === workspaceId).delete)
            .recover { case e: Throwable =>
              log.error(s"The event with id $eventId could not be deleted:\n ${e.getMessage}")
              Future.successful(Left(InternalServerError, "Failed to delete event."))
            }
            .map(_ => NoContent -> Failure("The event was successfully deleted."))
      }
}
