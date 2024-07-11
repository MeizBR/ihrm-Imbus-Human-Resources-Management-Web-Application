package tests.api.Calendars

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.CalendarCalls

class DeleteCalendarSpec extends RestCallsSpec with CalendarCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the delete calendar rest call".title ^ sequential ^
    s2"""
      The user can delete:
        his calendar                                                                    $p1
        
      The workspace user cannot delete:
        his public calendar                                                             $n1
        another user's calendar                                                         $n2
        a calendar with invalid workspaceId                                             $n3
        a calendar with invalid calendarId                                              $n4
    """

  private def p1 = deleteCalendar(1, calendarId = 15)(using userToken) should beRight

  private def n1 = deleteCalendar(1, calendarId = 4)(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
  }

  private def n2 = deleteCalendar(1, calendarId = 8)(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
  }

  private def n3 = deleteCalendar(10, calendarId = 8)(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
  }

  private def n4 = deleteCalendar(1, calendarId = 80)(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
  }
}
