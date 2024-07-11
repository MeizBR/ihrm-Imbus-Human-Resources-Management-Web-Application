package tests.api.Events

import api.enumeration.{EventType, Repetitive}
import java.time.Instant
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.RestErrorFactory.Failure

import java.time.format.DateTimeFormatter
import api.generated.events.{Event, PostEvent}
import org.specs2.specification.core.SpecStructure
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.matcher.MatchResult
import utils.Calls.EventCalls
import utils.HttpClient.Result

class PostEventSpec extends RestCallsSpec with EventCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the Post event rest call".title ^ sequential ^
    s2"""
        The default workspace admin can:
            create an event with any public global calendar                                             $p0
            create an event with any public project calendar                                            $p1
            create an event with his own global public calendar                                         $p2
            create an event with his own global private calendar                                        $p3
            create an event with his own project public calendar                                        $p4
            create an event with his own project private calendar                                       $p5
            create an event with no defined repetitive value                                            $p6

        The default workspace admin cannot:
            create an event with invalid workspaceId                                                    $n0
            create an event with invalid calendarId                                                     $n1
            create an event with another user's global private calendar                                 $n2
            create an event with another user's project private calendar                                $n3
            create an event where start date is after end date                                          $n4
            create an event with invalid repetition enumeration                                         $n12
            create an event with invalid event type enumeration                                         $n13

        Any workspace user can:
            create an event with any public global calendar                                             $p7
            create an event with any public project calendar                                            $p8
            create an event with his own global public calendar                                         $p9
            create an event with his own global private calendar                                        $p10
            create an event with his own project public calendar                                        $p11
            create an event with his own project private calendar                                       $p12
            create an event with  with no defined repetitive value                                      $p13

        Any workspace user cannot:
            create an event with invalid workspaceId                                                    $n5
            create an event with invalid calendarId                                                     $n6
            create an event with another user's global private calendar                                 $n7
            create an event with another user's project private calendar                                $n8
            create an event where start date is after end date                                          $n9
            create an event where start and end date times are equals                                   $n10
            create an event with calendar where he has not a role in it's project                       $n11
            create an event with invalid repetition enumeration                                         $n14
            create an event with invalid event type enumeration                                         $n15
    """

  private def p0: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 1,
      Instant.parse("2021-10-15T08:00:00.00Z"),
      Instant.parse("2021-10-18T09:00:00.00Z"),
      "Event 1",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = false,
      EventType.Meeting.toString
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.calendarId === 1 and
    event.start === Instant.parse("2021-10-15T08:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T09:00:00.00Z") and
    event.title === "Event 1" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === false and
    event.eventType === EventType.Meeting.toString
  }

  private def p1: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 10,
      Instant.parse("2022-08-05T08:00:00.00Z"),
      Instant.parse("2022-08-05T10:00:00.00Z"),
      "Event 2",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Meeting.toString
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.calendarId === 10 and
    event.start === Instant.parse("2022-08-05T08:00:00.00Z") and
    event.end === Instant.parse("2022-08-05T10:00:00.00Z") and
    event.title === "Event 2" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === true and
    event.eventType === EventType.Meeting.toString
  }

  private def p2: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 1,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 3",
      Some(""),
      Some(Repetitive.Weekly.toString),
      allDay = true,
      EventType.Meeting.toString
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.calendarId === 1 and
    event.start === Instant.parse("2021-10-15T00:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T00:00:00.00Z") and
    event.title === "Event 3" and
    event.description === "" and
    event.repetition === Repetitive.Weekly.toString and
    event.allDay === true and
    event.eventType === EventType.Meeting.toString
  }

  private def p3: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 5,
      Instant.parse("2021-10-15T08:00:00.00Z"),
      Instant.parse("2021-10-18T09:00:00.00Z"),
      "Event 4",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = false,
      EventType.Workshop.toString
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.calendarId === 5 and
    event.start === Instant.parse("2021-10-15T08:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T09:00:00.00Z") and
    event.title === "Event 4" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === false and
    event.eventType === EventType.Workshop.toString
  }

  private def p4: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 4,
      Instant.parse("2021-10-15T08:00:00.00Z"),
      Instant.parse("2021-10-18T09:00:00.00Z"),
      "Event 5",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = false,
      EventType.Workshop.toString
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.calendarId === 4 and
    event.start === Instant.parse("2021-10-15T08:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T09:00:00.00Z") and
    event.title === "Event 5" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === false and
    event.eventType === EventType.Workshop.toString
  }

  private def p5: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 6,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.calendarId === 6 and
    event.start === Instant.parse("2021-10-15T00:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T00:00:00.00Z") and
    event.title === "Event 6" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString
  }

  private def p6: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 6,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      None,
      allDay = true,
      EventType.Training.toString
    )
  )(using workspaceAdminToken) should beRight { (event: Event) =>
    event.calendarId === 6 and
    event.start === Instant.parse("2021-10-15T00:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T00:00:00.00Z") and
    event.title === "Event 6" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === true and
    event.eventType === EventType.Training.toString
  }

  private def p7: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 1,
      Instant.parse("2021-10-15T08:00:00.00Z"),
      Instant.parse("2021-10-18T09:00:00.00Z"),
      "Event 7",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = false,
      EventType.Meeting.toString
    )
  )(using userToken) should beRight { (event: Event) =>
    event.calendarId === 1 and
    event.start === Instant.parse("2021-10-15T08:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T09:00:00.00Z") and
    event.title === "Event 7" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === false and
    event.eventType === EventType.Meeting.toString
  }

  private def p8: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 4,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 8",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Meeting.toString
    )
  )(using userToken) should beRight { (event: Event) =>
    event.calendarId === 4 and
    event.start === Instant.parse("2021-10-15T00:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T00:00:00.00Z") and
    event.title === "Event 8" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === true and
    event.eventType === EventType.Meeting.toString
  }

  private def p9: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 13,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 9",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Meeting.toString
    )
  )(using userToken) should beRight { (event: Event) =>
    event.calendarId === 13 and
    event.start === Instant.parse("2021-10-15T00:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T00:00:00.00Z") and
    event.title === "Event 9" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === true and
    event.eventType === EventType.Meeting.toString
  }

  private def p10: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 15,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 10",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Meeting.toString
    )
  )(using userToken) should beRight { (event: Event) =>
    event.calendarId === 15 and
    event.start === Instant.parse("2021-10-15T00:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T00:00:00.00Z") and
    event.title === "Event 10" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === true and
    event.eventType === EventType.Meeting.toString
  }

  private def p11: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 14,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 11",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Meeting.toString
    )
  )(using userToken) should beRight { (event: Event) =>
    event.calendarId === 14 and
    event.start === Instant.parse("2021-10-15T00:00:00.00Z") and
    event.end === Instant.parse("2021-10-18T00:00:00.00Z") and
    event.title === "Event 11" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === true and
    event.eventType === EventType.Meeting.toString
  }

  private def p12: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 15,
      Instant.parse("2021-10-15T10:00:00.00Z"),
      Instant.parse("2021-10-15T12:00:00.00Z"),
      "Event 12",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = false,
      EventType.Meeting.toString
    )
  )(using userToken) should beRight { (event: Event) =>
    event.calendarId === 15 and
    event.start === Instant.parse("2021-10-15T10:00:00.00Z") and
    event.end === Instant.parse("2021-10-15T12:00:00.00Z") and
    event.title === "Event 12" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === false and
    event.eventType === EventType.Meeting.toString
  }

  private def p13: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 15,
      Instant.parse("2021-10-15T10:00:00.00Z"),
      Instant.parse("2021-10-15T12:00:00.00Z"),
      "Event 13",
      Some(""),
      None,
      allDay = false,
      EventType.Meeting.toString
    )
  )(using userToken) should beRight { (event: Event) =>
    event.calendarId === 15 and
    event.start === Instant.parse("2021-10-15T10:00:00.00Z") and
    event.end === Instant.parse("2021-10-15T12:00:00.00Z") and
    event.title === "Event 13" and
    event.description === "" and
    event.repetition === Repetitive.Unrepeatable.toString and
    event.allDay === false and
    event.eventType === EventType.Meeting.toString
  }

  private def n0: MatchResult[Result[Event]] = postEvent(
    workspaceId = 10,
    event = PostEvent(
      calendarId = 10,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n1: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 404,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
  }

  private def n2: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 12,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n3: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 12,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n4: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 9,
      Instant.parse("2021-10-19T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity
  }

  private def n5: MatchResult[Result[Event]] = postEvent(
    workspaceId = 404,
    event = PostEvent(
      calendarId = 10,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n6: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 404,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n7: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 11,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n8: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 12,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n9: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 9,
      Instant.parse("2021-10-18T00:00:00.00Z"),
      Instant.parse("2021-10-15T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity
  }

  private def n10: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 9,
      Instant.parse("2021-10-18T09:00:00.00Z"),
      Instant.parse("2021-10-18T09:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = false,
      EventType.Training.toString
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n11: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 2,
      Instant.parse("2021-10-18T00:00:00.00Z"),
      Instant.parse("2021-10-15T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = true,
      EventType.Training.toString
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n12: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 1,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some("test"),
      allDay = true,
      EventType.Training.toString
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Invalid enumeration value.")
  }

  private def n13: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 1,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Weekly.toString),
      allDay = true,
      "test"
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Invalid enumeration value.")
  }

  private def n14: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 13,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some("test"),
      allDay = true,
      EventType.Training.toString
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Invalid enumeration value.")
  }

  private def n15: MatchResult[Result[Event]] = postEvent(
    workspaceId = 1,
    event = PostEvent(
      calendarId = 13,
      Instant.parse("2021-10-15T00:00:00.00Z"),
      Instant.parse("2021-10-18T00:00:00.00Z"),
      "Event 6",
      Some(""),
      Some(Repetitive.Weekly.toString),
      allDay = true,
      "test"
    )
  )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Invalid enumeration value.")
  }
}
