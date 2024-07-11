package tests.api.Events

import api.enumeration.{EventType, Repetitive}
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.events.{Event, PatchEvent}
import org.specs2.matcher.MatchResult
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.EventCalls
import utils.HttpClient.Result

import java.time.Instant

class PatchEventSpec extends RestCallsSpec with EventCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the Patch event rest call".title ^ sequential ^
    s2"""
        The default workspace admin can update:
            any public event ( without updating its calendar visibility )                               $p0
            his own private event                                                                       $p1
            his public event visibility ( move it from public to private )                              $p2
            his private event visibility ( move it from private to public )                             $p3

        The default workspace admin cannot update:
            an event with invalid workspaceId                                                           $n0
            an event with invalid eventId                                                               $n1
            an event with invalid calendarId                                                            $n2
            a not owned event visibility (from public to private )                                      $n3
            an event where start date is after end date                                                 $n4
            an event with invalid repetition enumeration                                                $n10
            an event with invalid event type enumeration                                                $n11

        Any workspace user can update:
            any global public event ( without updating its calendar visibility )                        $p4
            any project public event where he has a role ( without updating its calendar visibility )   $p5
            his own private event                                                                       $p6
            his public event visibility ( move it from public to private )                              $p7
            his private event visibility ( move it from private to public )                             $p8
            any event (move it from public to public calendar)                                          $p9

        Any workspace user cannot update:
            an event with invalid workspaceId                                                           $n5
            an event with invalid eventId                                                               $n6
            an event with invalid calendarId                                                            $n7
            a not owned event visibility                                                                $n8
            an event where start date is after end date                                                 $n9
            an event with invalid repetition enumeration                                                $n12
            an event with invalid event type enumeration                                                $n13
    """

  private def p0: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 1,
    PatchEvent(
      None,
      None,
      None,
      Some("New title for event 1"),
      Some("public project 1 calendar: userId 1"),
      Some(Repetitive.Weekly.toString),
      Some(true),
      Some(EventType.Training.toString)
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.id === 1 and
    event.calendarId === 1 and
    event.isPrivateCalendar === false and
    event.start === Instant.ofEpochMilli(1609488000000L) and
    event.end === Instant.ofEpochMilli(1609491600000L) and
    event.title === "New title for event 1" and
    event.description === "public project 1 calendar: userId 1" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString and
    event.creator === 1
  }

  private def p1: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 5,
    PatchEvent(
      None,
      None,
      None,
      Some("New title for event 5"),
      Some("private global calendar: userId 1"),
      Some(Repetitive.Weekly.toString),
      Some(true),
      Some(EventType.Training.toString)
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.id === 5 and
    event.calendarId === 5 and
    event.isPrivateCalendar === true and
    event.start === Instant.ofEpochMilli(1614940200000L) and
    event.end === Instant.ofEpochMilli(1614943800000L) and
    event.title === "New title for event 5" and
    event.description === "private global calendar: userId 1" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString and
    event.creator === 1
  }

  private def p2: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 1,
    PatchEvent(
      Some(6),
      None,
      None,
      Some("Event 1"),
      Some("public project 1 calendar: userId 1"),
      Some(Repetitive.Weekly.toString),
      Some(false),
      Some(EventType.Training.toString)
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.id === 1 and
    event.calendarId === 6 and
    event.isPrivateCalendar === true and
    event.start === Instant.ofEpochMilli(1609488000000L) and
    event.end === Instant.ofEpochMilli(1609491600000L) and
    event.title === "Event 1" and
    event.description === "public project 1 calendar: userId 1" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === false and
    event.eventType === EventType.Training.toString and
    event.creator === 1
  }

  private def p3: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 1,
    PatchEvent(
      Some(1),
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.id === 1 and
    event.calendarId === 1 and
    event.isPrivateCalendar === false and
    event.start === Instant.ofEpochMilli(1609488000000L) and
    event.end === Instant.ofEpochMilli(1609491600000L) and
    event.title === "Event 1" and
    event.description === "public project 1 calendar: userId 1" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === false and
    event.eventType === EventType.Training.toString and
    event.creator === 1
  }

  private def n0: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 404,
    eventId = 1,
    PatchEvent(
      None,
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n1: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 404,
    PatchEvent(
      None,
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
  }

  private def n2: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 1,
    PatchEvent(
      Some(404),
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
  }

  private def n3: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 2,
    PatchEvent(
      Some(6),
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n4: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 1,
    PatchEvent(
      None,
      Some(Instant.parse("2021-03-03T08:00:00.00Z")),
      Some(Instant.parse("2021-01-01T09:00:00.00Z")),
      None,
      None,
      None,
      None,
      None
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity
  }

  private def p4: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 3,
    PatchEvent(
      None,
      None,
      None,
      Some("New title for event 3"),
      Some("global public calendar: userId 1"),
      Some(Repetitive.Weekly.toString),
      Some(true),
      Some(EventType.Training.toString)
    )
  )(using userToken) should beRight { (event: Event) =>
    event.id === 3 and
    event.calendarId === 14 and
    event.isPrivateCalendar === false and
    event.start === Instant.ofEpochMilli(1570284000000L) and
    event.end === Instant.ofEpochMilli(1570374000000L) and
    event.title === "New title for event 3" and
    event.description === "global public calendar: userId 1" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString and
    event.creator === 1
  }

  private def p5: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 7,
    PatchEvent(
      None,
      None,
      None,
      Some("New title for event 7"),
      Some("public project 3 calendar: userId 4"),
      Some(Repetitive.Weekly.toString),
      Some(true),
      Some(EventType.Training.toString)
    )
  )(using userToken) should beRight { (event: Event) =>
    event.id === 7 and
    event.calendarId === 18 and
    event.isPrivateCalendar === false and
    event.start === Instant.ofEpochMilli(1609666200000L) and
    event.end === Instant.ofEpochMilli(1609673400000L) and
    event.title === "New title for event 7" and
    event.description === "public project 3 calendar: userId 4" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString and
    event.creator === 4
  }

  private def p6: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 4,
    PatchEvent(
      None,
      None,
      None,
      Some("New title for event 4"),
      Some("private project 1 calendar: userId 3"),
      Some(Repetitive.Weekly.toString),
      Some(true),
      Some(EventType.Training.toString)
    )
  )(using leadToken) should beRight { (event: Event) =>
    event.id === 4 and
    event.calendarId === 12 and
    event.isPrivateCalendar === true and
    event.start === Instant.ofEpochMilli(1620228600000L) and
    event.end === Instant.ofEpochMilli(1620316800000L) and
    event.title === "New title for event 4" and
    event.description === "private project 1 calendar: userId 3" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString and
    event.creator === 3
  }

  private def p7: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 2,
    PatchEvent(
      Some(16),
      None,
      None,
      Some("Event 2"),
      Some("public project 3 calendar: userId 5"),
      Some(Repetitive.Weekly.toString),
      Some(true),
      Some(EventType.Training.toString)
    )
  )(using userToken) should beRight { (event: Event) =>
    event.id === 2 and
    event.calendarId === 16 and
    event.isPrivateCalendar === true and
    event.start === Instant.ofEpochMilli(1604217600000L) and
    event.end === Instant.ofEpochMilli(1604242800000L) and
    event.title === "Event 2" and
    event.description === "public project 3 calendar: userId 5" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString and
    event.creator === 5
  }

  private def p8: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 2,
    event = PatchEvent(
      Some(4),
      None,
      None,
      Some("Event 2"),
      Some("public project 3 calendar: userId 5"),
      Some(Repetitive.Weekly.toString),
      Some(true),
      Some(EventType.Training.toString)
    )
  )(using userToken) should beRight { (event: Event) =>
    event.id === 2 and
    event.calendarId === 4 and
    event.isPrivateCalendar === false and
    event.start === Instant.ofEpochMilli(1604217600000L) and
    event.end === Instant.ofEpochMilli(1604242800000L) and
    event.title === "Event 2" and
    event.description === "public project 3 calendar: userId 5" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString and
    event.creator === 5
  }

  private def p9: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 7,
    event = PatchEvent(
      Some(18),
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using userToken) should beRight { (event: Event) =>
    event.id === 7 and
    event.calendarId === 18 and
    event.isPrivateCalendar === false and
    event.start === Instant.ofEpochMilli(1609666200000L) and
    event.end === Instant.ofEpochMilli(1609673400000L) and
    event.title === "New title for event 7" and
    event.description === "public project 3 calendar: userId 4" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString and
    event.creator === 4
  }

  private def n5: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 404,
    eventId = 1,
    PatchEvent(
      None,
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n6: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 404,
    event = PatchEvent(
      None,
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n7: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 1,
    event = PatchEvent(
      Some(404),
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n8: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 2,
    PatchEvent(
      Some(12),
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n9: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 2,
    PatchEvent(
      None,
      Some(Instant.parse("2021-03-03T08:00:00.00Z")),
      Some(Instant.parse("2021-01-01T09:00:00.00Z")),
      None,
      None,
      None,
      None,
      None
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity
  }

  private def n10: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 1,
    event = PatchEvent(
      None,
      None,
      None,
      None,
      None,
      Some("test"),
      None,
      None
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Invalid enumeration value.")
  }

  private def n11: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 1,
    event = PatchEvent(
      None,
      None,
      None,
      None,
      None,
      None,
      None,
      Some("test")
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Invalid enumeration value.")
  }

  private def n12: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 2,
    event = PatchEvent(
      None,
      None,
      None,
      None,
      None,
      Some("test"),
      None,
      None
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Invalid enumeration value.")
  }

  private def n13: MatchResult[Result[Event]] = patchEvent(
    workspaceId = 1,
    eventId = 2,
    event = PatchEvent(
      None,
      None,
      None,
      None,
      None,
      None,
      None,
      Some("test")
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Invalid enumeration value.")
  }
}
