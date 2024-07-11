package tests.api.Calendars

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.calendars.Calendar
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.CalendarCalls
import utils.RestErrorFactory.Failure

class GetCalendarSpec extends RestCallsSpec with CalendarCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the get calendar rest call".title ^ sequential ^
    s2"""
      The default workspace admin can:
          get any global public calendar                                                                  $p0
          get any project public calendar                                                                 $p1
          get his global private calendar                                                                 $p2
          get his project private calendar                                                                $p3

      The default workspace admin cannot:
          get a calendar with invalid workspaceId                                                         $n0
          get a calendar with invalid calendarId                                                          $n1
          get another user's private calendar                                                             $n2

      Any workspace user can:
          get any global public calendar                                                                  $p4
          get a project public calendar where he has a role                                               $p5
          get his global private calendar                                                                 $p6
          get his project private calendar                                                                $p7

      Any workspace user cannot:
          get a calendar with invalid workspaceId                                                         $n3
          get a calendar with invalid calendarId                                                          $n4
          get another user's private calendar                                                             $n5
          get project public calendar where he has not a role                                             $n6
    """

  private def p0 = getCalendar(1, 9)(using workspaceAdminToken) should beRight { (calendar: Calendar) =>
    calendar.name === "Calendar 9" and
    calendar.userId === 3 and
    calendar.projectId === None and
    calendar.description === "public without project" and
    calendar.timeZone === "Africa/Tunis" and
    calendar.isPrivate === false
  }

  private def p1 = getCalendar(1, 14)(using workspaceAdminToken) should beRight { (calendar: Calendar) =>
    calendar.name === "Calendar 14" and
    calendar.userId === 5 and
    calendar.projectId === Some(3) and
    calendar.description === "public in project 3" and
    calendar.timeZone === "Africa/Tunis" and
    calendar.isPrivate === false
  }

  private def p2 = getCalendar(1, 5)(using workspaceAdminToken) should beRight { (calendar: Calendar) =>
    calendar.name === "Calendar 5" and
    calendar.userId === 1 and
    calendar.projectId === None and
    calendar.description === "private without project" and
    calendar.timeZone === "Africa/Tunis" and
    calendar.isPrivate === true
  }

  private def p3 = getCalendar(1, 6)(using workspaceAdminToken) should beRight { (calendar: Calendar) =>
    calendar.name === "Calendar 6" and
    calendar.userId === 1 and
    calendar.projectId === Some(1) and
    calendar.description === "private in project 1" and
    calendar.timeZone === "Africa/Tunis" and
    calendar.isPrivate === true
  }

  private def n0 = getCalendar(20, 3)(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n1 = getCalendar(1, 50)(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
  }

  private def n2 = getCalendar(1, 11)(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def p4 = getCalendar(1, 9)(using userToken) should beRight { (calendar: Calendar) =>
    calendar.name === "Calendar 9" and
    calendar.userId === 3 and
    calendar.projectId === None and
    calendar.description === "public without project" and
    calendar.timeZone === "Africa/Tunis" and
    calendar.isPrivate === false
  }

  private def p5 = getCalendar(1, 14)(using userToken) should beRight { (calendar: Calendar) =>
    calendar.name === "Calendar 14" and
    calendar.userId === 5 and
    calendar.projectId === Some(3) and
    calendar.description === "public in project 3" and
    calendar.timeZone === "Africa/Tunis" and
    calendar.isPrivate === false
  }

  private def p6 = getCalendar(1, 15)(using userToken) should beRight { (calendar: Calendar) =>
    calendar.name === "Calendar 15" and
    calendar.userId === 5 and
    calendar.projectId === None and
    calendar.description === "private without project" and
    calendar.timeZone === "Africa/Tunis" and
    calendar.isPrivate === true
  }

  private def p7 = getCalendar(1, 16)(using userToken) should beRight { (calendar: Calendar) =>
    calendar.name === "Calendar 16" and
    calendar.userId === 5 and
    calendar.projectId === Some(3) and
    calendar.description === "private in project 3" and
    calendar.timeZone === "Africa/Tunis" and
    calendar.isPrivate === true
  }

  private def n3 = getCalendar(20, 3)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n4 = getCalendar(1, 50)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n5 = getCalendar(1, 8)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }

  private def n6 = getCalendar(1, 10)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }
}
