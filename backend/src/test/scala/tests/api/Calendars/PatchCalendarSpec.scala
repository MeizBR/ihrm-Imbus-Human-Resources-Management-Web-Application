package tests.api.Calendars

import api.enumeration.{EventType, Repetitive}
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.calendars.{Calendar, PatchCalendar}
import api.generated.events.{Event, PostEvent}
import api.generated.leaves.{Leave, PostLeave}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.{CalendarCalls, EventCalls, LeaveCalls}
import java.time.Instant
import java.time.format.DateTimeFormatter
import java.time.LocalDate

class PatchCalendarSpec
    extends RestCallsSpec
    with CalendarCalls
    with LeaveCalls
    with EventCalls
    with Authentication
    with HttpClient {

  override def is: SpecStructure = "Specification to check the patch calendar rest call".title ^ sequential ^
    s2"""
     The default workspace admin can :
         edit any public calendar without updating its visibility (make it private or public)      $p0
         edit his own calendar visibility ( from public to private )                               $p1

     The default workspace admin cannot:
         edit a private not owned calendar                                                         $n0
         update another user's calendar visibility (make it private or public)                     $n1
         edit a public calendar with a name already used                                           $n2
         edit a public user calendar with project where he has not a project role                  $n3
         edit a calendar with invalid workspaceId                                                  $n4
         edit a calendar with invalid calendarId                                                   $n5
         move a calendar from public to private if it's attached to foreign events                 $n12
         move a calendar from public to private if it's attached to foreign leaves                 $n14


     Any workspace user can:
         edit his own calendar                                                                     $p2
         edit his own calendar visibility ( from public to private )                               $p3

    Any workspace user cannot:
         edit another user's calendar                                                              $n6
         edit his private calendar with a name already used                                        $n7
         edit his public calendar with a name already used                                         $n8
         edit his calendar with a project where he does not have role                              $n9
         edit a calendar with invalid workspaceId                                                  $n10
         edit a calendar with invalid calendarId                                                   $n11
         move a calendar from public to private if it's attached to foreign events                 $n13
         move a calendar from public to private if it's attached to foreign leaves                 $n15
     """

  private def p0 =
    patchCalendar(
      1,
      calendarId = 3,
      PatchCalendar(Some("Calendar 30"), Some(1), Some("updated by admin"), None, None)
    )(using
      workspaceAdminToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Calendar 30" and
      calendar.projectId === Some(1) and
      calendar.description === "updated by admin" and
      calendar.isPrivate === false and
      calendar.userId === 1 and
      calendar.timeZone === "Africa/Tunis"
    }

  private def p1 =
    patchCalendar(
      1,
      calendarId = 2,
      PatchCalendar(None, Some(1), Some("updated by admin"), Some(true), None)
    )(using
      workspaceAdminToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Calendar 2" and
      calendar.projectId === Some(1) and
      calendar.description === "updated by admin" and
      calendar.isPrivate === true and
      calendar.userId === 1 and
      calendar.timeZone === "Africa/Tunis"
    }

  private def n0 =
    patchCalendar(
      1,
      calendarId = 11,
      PatchCalendar(Some("Calendar 50"), None, Some("updated by admin"), None, None)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n1 =
    patchCalendar(
      1,
      calendarId = 12,
      PatchCalendar(Some("Calendar 30"), None, Some("updated by admin"), Some(true), None)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n2 =
    patchCalendar(
      1,
      calendarId = 3,
      PatchCalendar(Some("Calendar 9"), Some(1), Some("updated by admin"), None, None)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def n3 =
    patchCalendar(
      1,
      calendarId = 9,
      PatchCalendar(None, Some(2), None, None, None)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n4 =
    patchCalendar(
      workspaceId = 50,
      calendarId = 3,
      PatchCalendar(None, None, None, None, None)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n5 =
    patchCalendar(
      workspaceId = 1,
      calendarId = 30,
      PatchCalendar(None, None, None, None, None)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound
    }

  private def p2 =
    patchCalendar(1, calendarId = 13, PatchCalendar(None, Some(3), Some("updated by creator"), None, None))(using
      userToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Calendar 13" and
      calendar.projectId === Some(3) and
      calendar.description === "updated by creator" and
      calendar.isPrivate === false and
      calendar.userId === 5 and
      calendar.timeZone === "Africa/Tunis"
    }

  private def p3 =
    patchCalendar(1, calendarId = 13, PatchCalendar(None, None, None, Some(true), None))(using
      userToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Calendar 13" and
      calendar.projectId === Some(3) and
      calendar.description === "updated by creator" and
      calendar.isPrivate === true and
      calendar.userId === 5 and
      calendar.timeZone === "Africa/Tunis"
    }

  private def n6 =
    patchCalendar(
      1,
      calendarId = 2,
      PatchCalendar(None, Some(1), None, None, None)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n7 =
    patchCalendar(
      1,
      calendarId = 16,
      PatchCalendar(Some("Calendar 13"), Some(3), None, Some(true), None)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def n8 =
    patchCalendar(
      1,
      calendarId = 14,
      PatchCalendar(Some("Calendar 1"), None, None, None, None)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def n9 =
    patchCalendar(
      1,
      calendarId = 7,
      PatchCalendar(None, Some(2), None, None, None)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n10 =
    patchCalendar(
      workspaceId = 50,
      calendarId = 3,
      PatchCalendar(None, None, None, None, None)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n11 =
    patchCalendar(
      workspaceId = 1,
      calendarId = 30,
      PatchCalendar(None, None, None, None, None)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n12 = postEvent(
    1,
    PostEvent(
      1,
      Instant.parse("2019-10-05T14:00:00.00Z"),
      Instant.parse("2019-10-05T17:00:00.00Z"),
      "Event 90",
      Some(""),
      Some(Repetitive.Unrepeatable.toString),
      allDay = false,
      EventType.Meeting.toString
    )
  )(using supervisorToken) should beRight { (_: Event) =>
    patchCalendar(
      1,
      calendarId = 1,
      PatchCalendar(None, None, None, Some(true), None)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }
  }

  private def n13 =
    postEvent(
      1,
      PostEvent(
        18,
        Instant.parse("2019-10-05T14:00:00.00Z"),
        Instant.parse("2019-10-05T17:00:00.00Z"),
        "Event 99",
        Some(""),
        Some(Repetitive.Unrepeatable.toString),
        allDay = false,
        EventType.Meeting.toString
      )
    )(using workspaceAdminToken) should beRight { (_: Event) =>
      patchCalendar(
        1,
        calendarId = 18,
        PatchCalendar(None, None, None, Some(true), None)
      )(using
        supervisorToken
      ) should beLeft { (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden
      }
    }

  private def n14 = postLeave(
    1,
    Some(4),
    PostLeave(
      LocalDate.parse("2021-09-15", formatter),
      isFullDayStart = true,
      LocalDate.parse("2021-09-17", formatter),
      isFullDayEnd = true,
      2,
      "Sick",
      "New description",
      Some("Waiting")
    )
  )(using workspaceAdminToken) should beRight { (_: Leave) =>
    patchCalendar(
      1,
      calendarId = 1,
      PatchCalendar(None, None, None, Some(true), None)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }
  }

  private def n15 = postLeave(
    1,
    Some(1),
    PostLeave(
      LocalDate.parse("2022-01-01", formatter),
      isFullDayStart = true,
      LocalDate.parse("2022-01-02", formatter),
      isFullDayEnd = true,
      2,
      "Holiday",
      "New description",
      Some("Waiting")
    )
  )(using workspaceAdminToken) should beRight { (_: Leave) =>
    patchCalendar(
      1,
      calendarId = 2,
      PatchCalendar(None, None, None, Some(true), None)
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }
  }

}
