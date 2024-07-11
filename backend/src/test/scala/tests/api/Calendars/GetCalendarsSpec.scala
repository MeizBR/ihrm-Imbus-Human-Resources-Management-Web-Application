package tests.api.Calendars

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.calendars.Calendar
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.CalendarCalls

class GetCalendarsSpec extends RestCallsSpec with CalendarCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the get calendars rest call".title ^ sequential ^
    s2"""
      The default workspace admin can :
          get list of public global calendars                                                       $p0
          get list of public project calendars                                                      $p1
          get list of his private global calendars                                                  $p2
          get list of his private project calendars                                                 $p3
          get all global calendars                                                                  $p4 //fixme: it returns not only global calendars
          get all project calendars                                                                 $p5

      The default workspace admin cannot:
          get list of calendars with invalid projectId                                              $n0
          get list of calendars with invalid workspaceId                                            $n1
  
      The workspace user can:
          get list of public global calendars                                                       $p6
          get list of public project calendars                                                      $p7
          get list of his private global calendars                                                  $p8
          get list of his private project calendars                                                 $p9
          get all global calendars                                                                  $p10
          get all project calendars                                                                 $p11
    
      The workspace user cannot:
          get list of calendars with invalid projectId                                              $n2
          get list of calendars with invalid workspaceId                                            $n3
    """

  private def p0 = getCalendars(1, None, Some(false))(using workspaceAdminToken) should beRight {
    (calendars: List[Calendar]) =>
      // Create a set of expected calendar names for easier verification
      val expectedCalendarNames = Set("Calendar 1", "Calendar 9")
      // Convert the list of calendars to a set of their names for comparison
      val actualCalendarNames   = calendars.map(_.name).toSet

      // Verify that each expected calendar name is present in the actual set of names
      expectedCalendarNames.forall(name => actualCalendarNames.contains(name)) must beTrue
  }

  private def p1 = getCalendars(1, Some(1), Some(false))(using workspaceAdminToken) should beRight {
    (calendars: List[Calendar]) =>
      val calendar1 = calendars.head
      val calendar2 = calendars.last
      calendar2.name === "Calendar 2" and calendar2.userId === 1 and calendar2.projectId === Some(
        1
      ) and calendar2.description === "public in project 1" and calendar2.timeZone === "Africa/Tunis" and calendar2.isPrivate ===
        false
      calendar1.name === "Calendar 10" and calendar1.userId === 3 and calendar1.projectId === Some(
        1
      ) and calendar1.description === "public in project 1" and calendar1.timeZone === "Africa/Tunis" and calendar1.isPrivate ===
        false
  }

  private def p2 = getCalendars(1, None, Some(true))(using workspaceAdminToken) should beRight {
    (calendars: List[Calendar]) =>
      // Map of expected calendars by some unique identifier (e.g., name) to their expected properties
      val expectedCalendars = Map(
        "Calendar 5" -> ("private without project", true, 1, None),
        "Calendar 8" -> ("private in project 3", true, 1, Some(3))
      )

      // Convert the actual list of calendars to a map by their unique identifier for easier verification
      val actualCalendars = calendars.map(c => c.name -> (c.description, c.isPrivate, c.userId, c.projectId)).toMap

      // Verify that each expected calendar's properties match the actual calendar properties
      expectedCalendars.forall { case (name, expectedProperties) =>
        actualCalendars.get(name) must beSome(expectedProperties)
      }
  }

  private def p3 = getCalendars(1, Some(1), Some(true))(using workspaceAdminToken) should beRight {
    (calendars: List[Calendar]) =>
      val calendar1 = calendars.head
      calendar1.name === "Calendar 6" and calendar1.userId === 1 and calendar1.projectId === Some(
        1
      ) and calendar1.description === "private in project 1" and calendar1.timeZone === "Africa/Tunis" and calendar1.isPrivate ===
        true
  }

  private def p4 = getCalendars(1, None, None)(using workspaceAdminToken) should beRight {
    (calendars: List[Calendar]) =>
      // Assert that the list contains calendars with the specified properties
      calendars must contain((calendar: Calendar) =>
        calendar.description === "private without project" && calendar.isPrivate === true && calendar.userId === 1
      ).atLeastOnce

      calendars must contain((calendar: Calendar) =>
        calendar.description === "public in project 3" && calendar.isPrivate === false && calendar.userId === 4
      ).atLeastOnce
  }

  private def p5 = getCalendars(1, Some(1), None)(using workspaceAdminToken) should beRight {
    (calendars: List[Calendar]) =>
      val calendar1 = calendars.head
      val calendar2 = calendars.last
      calendar1.name === "Calendar 10" and calendar1.userId === 3 and calendar1.projectId === Some(
        1
      ) and calendar1.description === "public in project 1" and calendar1.timeZone === "Africa/Tunis" and calendar1.isPrivate ===
        false
      calendar2.name === "Calendar 6" and calendar2.userId === 1 and calendar2.projectId === Some(
        1
      ) and calendar2.description === "private in project 1" and calendar2.timeZone === "Africa/Tunis" and calendar2.isPrivate ===
        true
  }

  private def p6 = getCalendars(1, None, Some(false))(using userToken) should beRight { (calendars: List[Calendar]) =>
    // Assert that the list contains calendars with the specified properties
    calendars must contain((calendar: Calendar) =>
      calendar.description === "public without project" && calendar.isPrivate === false && calendar.userId === 1
    ).atLeastOnce

    calendars must contain((calendar: Calendar) =>
      calendar.description === "public without project" && calendar.isPrivate === false && calendar.userId === 3
    ).atLeastOnce
  }

  private def p7 = getCalendars(1, Some(3), Some(false))(using userToken) should beRight {
    (calendars: List[Calendar]) =>
      val calendar1 = calendars.head
      val calendar2 = calendars.last
      calendar1.name === "Calendar 14" and calendar1.userId === 3 and calendar1.projectId === Some(
        3
      ) and calendar1.description === "public in project 3" and calendar1.timeZone === "Africa/Tunis" and calendar1.isPrivate ===
        false
      calendar2.name === "Calendar 4" and calendar2.userId === 1 and calendar2.projectId === Some(
        3
      ) and calendar2.description === "public in project 3" and calendar2.timeZone === "Africa/Tunis" and calendar2.isPrivate ===
        false
  }

  private def p8 = getCalendars(1, None, Some(true))(using userToken) should beRight { (calendars: List[Calendar]) =>
    // Assert that the list contains calendars with the specified properties
    calendars must contain((calendar: Calendar) =>
      calendar.description === "private without project" && calendar.isPrivate === true && calendar.userId === 5 && calendar.projectId === None
    ).atLeastOnce

    calendars must contain((calendar: Calendar) =>
      calendar.description === "private in project 3" && calendar.isPrivate === true && calendar.userId === 5 && calendar.projectId === Some(
        3
      )
    ).atLeastOnce
  }

  private def p9 = getCalendars(1, Some(3), Some(true))(using userToken) should beRight { (calendars: List[Calendar]) =>
    val calendar2 = calendars.head
    calendar2.name === "Calendar 16" and calendar2.userId === 5 and calendar2.projectId === Some(
      3
    ) and calendar2.description === "private in project 3" and calendar2.timeZone === "Africa/Tunis" and calendar2.isPrivate ===
      true
  }

  private def p10 = getCalendars(1, None, None)(using userToken) should beRight { (calendars: List[Calendar]) =>
    // Assert that the list contains calendars with specified properties
    calendars must contain((calendar: Calendar) =>
      calendar.description === "private without project" && calendar.isPrivate === true && calendar.userId === 5
    ).atLeastOnce

    calendars must contain((calendar: Calendar) =>
      calendar.description === "public without project" && calendar.isPrivate === false && calendar.userId === 3
    ).atLeastOnce

    // Add more assertions if needed for other expected calendars
  }

  private def p11 = getCalendars(1, Some(3), None)(using userToken) should beRight { (calendars: List[Calendar]) =>
    val calendar1 = calendars.head
    val calendar2 = calendars.last
    calendar1.name === "Calendar 16" and calendar1.userId === 5 and calendar1.projectId === Some(
      3
    ) and calendar1.description === "private in project 3" and calendar1.timeZone === "Africa/Tunis" and calendar1.isPrivate ===
      true
    calendar2.name === "Calendar 4" and calendar2.userId === 1 and calendar2.projectId === Some(
      3
    ) and calendar2.description === "public in project 3" and calendar2.timeZone === "Africa/Tunis" and calendar2.isPrivate ===
      false
  }

  private def n0 = getCalendars(1, Some(200), Some(false))(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound
  }

  private def n1 = getCalendars(20, Some(1), Some(false))(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
  }

  private def n2 = getCalendars(1, Some(200), Some(false))(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
  }

  private def n3 = getCalendars(20, Some(3), Some(false))(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
  }
}
