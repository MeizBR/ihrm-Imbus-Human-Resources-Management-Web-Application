package tests.api.Events

import api.enumeration.{EventType, Repetitive}
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.events.Event
import org.specs2.matcher.MatchResult
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.EventCalls
import utils.HttpClient.Result

import java.time.Instant

class GetEventsSpec extends RestCallsSpec with EventCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the Get events rest call".title ^ sequential ^
    s2"""
        The default workspace admin can get:
            list of events                                                                            $p0
            list of filtered events by calendarId                                                     $p1
            list of public events                                                                     $p2
            list of private events                                                                    $p3

        The default workspace admin cannot:
            list of events with invalid workspaceId                                                   $n0
            list of events with invalid calendarId                                                    $n1
            list of events with private not owned calendar                                            $n2

        Any workspace user can:
            list of events                                                                            $p4
            list of filtered events by calendarId                                                     $p5
            list of public events                                                                     $p6
            list of private events                                                                    $p7

        Any workspace user cannot:
            list of events with invalid workspaceId                                                   $n3
            list of events with invalid calendarId                                                    $n4
            list of events with private not owned calendar                                            $n5
            list of events with public project calendar where he has not a role                       $n6
    """

  private def p0: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, None, None)(using workspaceAdminToken) should beRight { (events: List[Event]) =>
      lazy val event1 = events.head
      lazy val event2 = events.last
      event1.id === 5 and
      event1.calendarId === 5 and
      event1.isPrivateCalendar === true and
      event1.start === Instant.ofEpochMilli(1614940200000L) and
      event1.end === Instant.ofEpochMilli(1614943800000L) and
      event1.title === "Event 5" and
      event1.description === "private global calendar: userId 1" and
      event1.repetition === Repetitive.Daily.toString and
      event1.allDay === false and
      event1.eventType === EventType.Meeting.toString and
      event1.creator === 1 and
      event2.id === 3 and
      event2.calendarId === 14 and
      event2.isPrivateCalendar === false and
      event2.start === Instant.ofEpochMilli(1570284000000L) and
      event2.end === Instant.ofEpochMilli(1570374000000L) and
      event2.title === "Event 3" and
      event2.description === "global public calendar: userId 1" and
      event2.repetition === Repetitive.Daily.toString and
      event2.allDay === false and
      event2.eventType === EventType.Meeting.toString and
      event2.creator === 1
    }

  private def p1: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, Some(1), None)(using workspaceAdminToken) should beRight { (events: List[Event]) =>
      lazy val event1 = events.head
      event1.id === 1 and
      event1.calendarId === 1 and
      event1.isPrivateCalendar === false and
      event1.start === Instant.ofEpochMilli(1609488000000L) and
      event1.end === Instant.ofEpochMilli(1609491600000L) and
      event1.title === "Event 1" and
      event1.description === "public project 1 calendar: userId 1" and
      event1.repetition === Repetitive.Daily.toString and
      event1.allDay === false and
      event1.eventType === EventType.Meeting.toString and
      event1.creator === 1
    }

  private def p2: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, None, Some(false))(using workspaceAdminToken) should beRight { (events: List[Event]) =>
      lazy val event1 = events.head
      lazy val event2 = events.last
      event1.id === 7 and
      event1.calendarId === 18 and
      event1.isPrivateCalendar === false and
      event1.start === Instant.ofEpochMilli(1609666200000L) and
      event1.end === Instant.ofEpochMilli(1609673400000L) and
      event1.title === "Event 7" and
      event1.description === "public project 3 calendar: userId 4" and
      event1.repetition === Repetitive.Daily.toString and
      event1.allDay === false and
      event1.eventType === EventType.Meeting.toString and
      event1.creator === 4 and
      event2.id === 3 and
      event2.calendarId === 14 and
      event2.isPrivateCalendar === false and
      event2.start === Instant.ofEpochMilli(1570284000000L) and
      event2.end === Instant.ofEpochMilli(1570374000000L) and
      event2.title === "Event 3" and
      event2.description === "global public calendar: userId 1" and
      event2.repetition === Repetitive.Daily.toString and
      event2.allDay === false and
      event2.eventType === EventType.Meeting.toString and
      event2.creator === 1
    }

  private def p3: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, None, Some(true))(using workspaceAdminToken) should beRight { (events: List[Event]) =>
      lazy val event1 = events.head
      lazy val event2 = events.last
      event1.id === 5 and
      event1.calendarId === 5 and
      event1.isPrivateCalendar === true and
      event1.start === Instant.ofEpochMilli(1614940200000L) and
      event1.end === Instant.ofEpochMilli(1614943800000L) and
      event1.title === "Event 5" and
      event1.description === "private global calendar: userId 1" and
      event1.repetition === Repetitive.Daily.toString and
      event1.allDay === false and
      event1.eventType === EventType.Meeting.toString and
      event1.creator === 1 and
      event2.id === 6 and
      event2.calendarId === 8 and
      event2.isPrivateCalendar === true and
      event2.start === Instant.ofEpochMilli(1612776600000L) and
      event2.end === Instant.ofEpochMilli(1612780200000L) and
      event2.title === "Event 6" and
      event2.description === "private project 1 calendar: userId 1" and
      event2.repetition === Repetitive.Daily.toString and
      event2.allDay === false and
      event2.eventType === EventType.Meeting.toString and
      event2.creator === 1
    }

  private def n0: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 404, None, None)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n1: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, calendarId = Some(404), None)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound and
        response._2 === Failure("Calendar not found.")
    }

  private def n2: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, calendarId = Some(12), None)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def p4: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, None, None)(using leadToken) should beRight { (events: List[Event]) =>
      lazy val event1 = events.head
      lazy val event2 = events.last
      event1.id === 4 and
      event1.calendarId === 12 and
      event1.isPrivateCalendar === true and
      event1.start === Instant.ofEpochMilli(1620228600000L) and
      event1.end === Instant.ofEpochMilli(1620316800000L) and
      event1.title === "Event 4" and
      event1.description === "private project 1 calendar: userId 3" and
      event1.repetition === Repetitive.Daily.toString and
      event1.allDay === false and
      event1.eventType === EventType.Meeting.toString and
      event2.id === 1 and
      event2.calendarId === 1 and
      event2.isPrivateCalendar === false and
      event2.start === Instant.ofEpochMilli(1609488000000L) and
      event2.end === Instant.ofEpochMilli(1609491600000L) and
      event2.title === "Event 1" and
      event2.description === "public project 1 calendar: userId 1" and
      event2.repetition === Repetitive.Daily.toString and
      event2.allDay === false and
      event2.eventType === EventType.Meeting.toString and
      event2.creator === 1
    }

  private def p5: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, Some(12), None)(using leadToken) should beRight { (events: List[Event]) =>
      lazy val event1 = events.head
      event1.id === 4 and
      event1.calendarId === 12 and
      event1.isPrivateCalendar === true and
      event1.start === Instant.ofEpochMilli(1620228600000L) and
      event1.end === Instant.ofEpochMilli(1620316800000L) and
      event1.title === "Event 4" and
      event1.description === "private project 1 calendar: userId 3" and
      event1.repetition === Repetitive.Daily.toString and
      event1.allDay === false and
      event1.eventType === EventType.Meeting.toString and
      event1.creator === 3
    }

  private def p6: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, None, Some(false))(using leadToken) should beRight { (events: List[Event]) =>
      lazy val event1 = events.head
      event1.id === 1 and
      event1.calendarId === 1 and
      event1.isPrivateCalendar === false and
      event1.start === Instant.ofEpochMilli(1609488000000L) and
      event1.end === Instant.ofEpochMilli(1609491600000L) and
      event1.title === "Event 1" and
      event1.description === "public project 1 calendar: userId 1" and
      event1.repetition === Repetitive.Daily.toString and
      event1.allDay === false and
      event1.eventType === EventType.Meeting.toString and
      event1.creator === 1
    }

  private def p7: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, None, Some(true))(using leadToken) should beRight { (events: List[Event]) =>
      lazy val event1 = events.head
      event1.id === 4 and
      event1.calendarId === 12 and
      event1.isPrivateCalendar === true and
      event1.start === Instant.ofEpochMilli(1620228600000L) and
      event1.end === Instant.ofEpochMilli(1620316800000L) and
      event1.title === "Event 4" and
      event1.description === "private project 1 calendar: userId 3" and
      event1.repetition === Repetitive.Daily.toString and
      event1.allDay === false and
      event1.eventType === EventType.Meeting.toString and
      event1.creator === 3
    }

  private def n3: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 404, None, None)(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n4: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, calendarId = Some(404), None)(using leadToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n5: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, calendarId = Some(20), None)(using leadToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n6: MatchResult[Result[List[Event]]] =
    getEvents(workspaceId = 1, calendarId = Some(18), None)(using leadToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }
}
