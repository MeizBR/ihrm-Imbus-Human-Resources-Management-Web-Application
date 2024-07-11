package tests.api.Events

import api.enumeration.{EventType, Repetitive}
import org.apache.pekko.http.scaladsl.model.StatusCode
import api.enumeration._
import api.generated.events.Event
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.RestErrorFactory.Failure
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.specs2.matcher.MatchResult
import utils.Calls.EventCalls
import utils.HttpClient.Result

import java.time.Instant

class GetEventByIdSpec extends RestCallsSpec with EventCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the Get event by id rest call".title ^ sequential ^
    s2"""
        The default workspace admin can get:
            his own event                                                                                     $p0
            any user's event when the calendar is public                                                      $p1

        The default workspace admin cannot get:
            any user's event when the calendar is private                                                     $n0
            an event with invalid workspaceId                                                                 $n1
            an event with invalid eventId                                                                     $n2

        Any workspace user can get:
            his own event                                                                                     $p2
            any user's event when the calendar is global public                                               $p3

        Any workspace user cannot get:
            any user's event when the calendar is private                                                     $n4
            any user's event when the calendar is a project public calendar and he has not a project role     $n5
            an event with invalid workspaceId                                                                 $n6
            an event with invalid eventId                                                                     $n7
    """

  private def p0: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 1)(using workspaceAdminToken) should beRight { (event: Event) =>
      event.id == 1 and
      event.calendarId == 1 and
      event.isPrivateCalendar == false and
      event.start == Instant.ofEpochMilli(1609488000000L) and
      event.end == Instant.ofEpochMilli(1609491600000L) and
      event.title == "Event 1" and
      event.description == "public project 1 calendar: userId 1" and
      event.repetition == Repetitive.Daily.toString and
      event.allDay == false and
      event.eventType == EventType.Meeting.toString and
      event.creator == 1
    }

  private def p1: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 2)(using workspaceAdminToken) should beRight { (event: Event) =>
      event.id == 2 and
      event.calendarId == 4 and
      event.isPrivateCalendar == false and
      event.start == Instant.ofEpochMilli(1604217600000L) and
      event.end == Instant.ofEpochMilli(1604242800000L) and
      event.title == "Event 2" and
      event.description == "public project 3 calendar: userId 5" and
      event.repetition == Repetitive.Daily.toString and
      event.allDay == false and
      event.eventType == EventType.Meeting.toString and
      event.creator == 5
    }

  private def n0: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 4)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n1: MatchResult[Result[Event]] =
    getEventById(workspaceId = 404, eventId = 1)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 404)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound and
        response._2 === Failure("Event not found.")
    }

  private def p2: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 2)(using userToken) should beRight { (event: Event) =>
      event.id == 2 and
      event.calendarId == 4 and
      event.isPrivateCalendar == false and
      event.start == Instant.ofEpochMilli(1604217600000L) and
      event.end == Instant.ofEpochMilli(1604242800000L) and
      event.title == "Event 2" and
      event.description == "public project 3 calendar: userId 5" and
      event.repetition == Repetitive.Daily.toString and
      event.allDay == false and
      event.eventType == EventType.Meeting.toString and
      event.creator == 5
    }

  private def p3: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 3)(using userToken) should beRight { (event: Event) =>
      event.id == 3 and
      event.calendarId == 14 and
      event.isPrivateCalendar == false and
      event.start == Instant.ofEpochMilli(1570284000000L) and
      event.end == Instant.ofEpochMilli(1570374000000L) and
      event.title == "Event 3" and
      event.description == "global public calendar: userId 1" and
      event.repetition == Repetitive.Daily.toString and
      event.allDay == false and
      event.eventType == EventType.Meeting.toString and
      event.creator == 1
    }

  private def n4: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 4)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n5: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 6)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n6: MatchResult[Result[Event]] =
    getEventById(workspaceId = 404, eventId = 2)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n7: MatchResult[Result[Event]] =
    getEventById(workspaceId = 1, eventId = 404)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
