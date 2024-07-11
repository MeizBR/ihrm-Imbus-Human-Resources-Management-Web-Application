package tests.api.Calendars

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.calendars.{Calendar, PostCalendar}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.CalendarCalls

import java.util.TimeZone

class PostCalendarSpec extends RestCallsSpec with CalendarCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the Post calendar rest call".title ^ sequential ^
    s2"""
    The default workspace admin can create:
        a global public calendar                                                                              $p0
        a global private calendar                                                                             $p1
        a project public calendar                                                                             $p2
        a project private calendar                                                                            $p3

    The default workspace admin cannot create:
        a calendar with invalid workspaceId                                                                   $n0
        a calendar with invalid projectId                                                                     $n1
        a public calendar with a name already used in another public global calendar                          $n2
        a private calendar with a name already used in another owned private calendar                         $n3
        a public calendar with a name already used in another public project calendar                         $n9

    Any workspace user can create:
        a global public calendar                                                                              $p4
        a global private calendar                                                                             $p5
        a project public calendar                                                                             $p6
        a project private calendar                                                                            $p7

    Any workspace user cannot create:
        a calendar with invalid workspaceId                                                                   $n4
        a calendar with invalid projectId                                                                     $n5
        a public calendar with a name already used in another public global calendar                          $n6
        a private calendar with a name already used in another owned private calendar                         $n7
        a project calendar with a project where he doesn't has role                                           $n8
        a public calendar with a name already used in another public project (where he has role) calendar     $n10
    """

  private def p0 =
    postCalendar(
      1,
      PostCalendar(
        name = "Global public Calendar 1",
        description = Some("description"),
        isPrivate = Some(false),
        timeZone = None
      ),
      projectId = None
    )(using
      workspaceAdminToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Global public Calendar 1" and
      calendar.projectId === None and
      calendar.description === "description" and
      calendar.isPrivate === false and
      calendar.userId === 1 and
      calendar.timeZone === TimeZone.getDefault.getID
    }

  private def p1 =
    postCalendar(
      1,
      PostCalendar(
        name = "Global private Calendar 1",
        description = Some("description"),
        isPrivate = Some(true),
        timeZone = None
      ),
      projectId = None
    )(using
      workspaceAdminToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Global private Calendar 1" and
      calendar.projectId === None and
      calendar.description === "description" and
      calendar.isPrivate === true and
      calendar.userId === 1 and
      calendar.timeZone === TimeZone.getDefault.getID
    }

  private def p2 =
    postCalendar(
      1,
      PostCalendar(
        name = "Project public Calendar 1",
        description = Some("description"),
        isPrivate = Some(false),
        timeZone = None
      ),
      projectId = Some(2)
    )(using
      workspaceAdminToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Project public Calendar 1" and
      calendar.projectId === Some(2) and
      calendar.description === "description" and
      calendar.isPrivate === false and
      calendar.userId === 1 and
      calendar.timeZone === TimeZone.getDefault.getID
    }

  private def p3 =
    postCalendar(
      1,
      PostCalendar(
        name = "Project private Calendar 1",
        description = Some("description"),
        isPrivate = Some(true),
        timeZone = None
      ),
      projectId = Some(2)
    )(using
      workspaceAdminToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Project private Calendar 1" and
      calendar.projectId === Some(2) and
      calendar.description === "description" and
      calendar.isPrivate === true and
      calendar.userId === 1 and
      calendar.timeZone === TimeZone.getDefault.getID
    }

  private def n0 =
    postCalendar(
      20,
      PostCalendar(name = "New Calendar", description = Some("description"), isPrivate = Some(true), timeZone = None),
      projectId = Some(2)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n1 =
    postCalendar(
      1,
      PostCalendar(name = "New Calendar", description = Some("description"), isPrivate = Some(true), timeZone = None),
      projectId = Some(5)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound
    }

  private def n2 =
    postCalendar(
      1,
      PostCalendar(
        name = "Global public Calendar 1",
        description = Some("description"),
        isPrivate = Some(false),
        timeZone = None
      ),
      projectId = None
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def n3 =
    postCalendar(
      1,
      PostCalendar(
        name = "Project private Calendar 1",
        description = Some("description"),
        isPrivate = Some(true),
        timeZone = None
      ),
      projectId = Some(2)
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def p4 =
    postCalendar(
      1,
      PostCalendar(
        name = "Global public Calendar 2",
        description = Some("description"),
        isPrivate = Some(false),
        timeZone = None
      ),
      projectId = None
    )(using
      userToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Global public Calendar 2" and
      calendar.projectId === None and
      calendar.description === "description" and
      calendar.isPrivate === false and
      calendar.userId === 5 and
      calendar.timeZone === TimeZone.getDefault.getID
    }

  private def p5 =
    postCalendar(
      1,
      PostCalendar(
        name = "Global private Calendar 1",
        description = Some("description"),
        isPrivate = Some(true),
        timeZone = None
      ),
      projectId = None
    )(using
      userToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Global private Calendar 1" and
      calendar.projectId === None and
      calendar.description === "description" and
      calendar.isPrivate === true and
      calendar.userId === 5 and
      calendar.timeZone === TimeZone.getDefault.getID
    }

  private def p6 =
    postCalendar(
      1,
      PostCalendar(
        name = "Project public Calendar 2",
        description = Some("description"),
        isPrivate = Some(false),
        timeZone = None
      ),
      projectId = Some(3)
    )(using
      userToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Project public Calendar 2" and
      calendar.projectId === Some(3) and
      calendar.description === "description" and
      calendar.isPrivate === false and
      calendar.userId === 5 and
      calendar.timeZone === TimeZone.getDefault.getID
    }

  private def p7 =
    postCalendar(
      1,
      PostCalendar(
        name = "Project private Calendar 2",
        description = Some("description"),
        isPrivate = Some(true),
        timeZone = None
      ),
      projectId = Some(3)
    )(using
      userToken
    ) should beRight { (calendar: Calendar) =>
      calendar.name === "Project private Calendar 2" and
      calendar.projectId === Some(3) and
      calendar.description === "description" and
      calendar.isPrivate === true and
      calendar.userId === 5 and
      calendar.timeZone === TimeZone.getDefault.getID
    }

  private def n4 =
    postCalendar(
      workspaceId = 20,
      PostCalendar(name = "New Calendar", description = Some("description"), isPrivate = Some(true), timeZone = None),
      projectId = Some(15)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n5 =
    postCalendar(
      1,
      PostCalendar(name = "New Calendar", description = Some("description"), isPrivate = Some(true), timeZone = None),
      Some(15)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n6 =
    postCalendar(
      1,
      PostCalendar(
        name = "Global public Calendar 2",
        description = Some("description"),
        isPrivate = Some(false),
        timeZone = None
      ),
      projectId = None
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def n7 =
    postCalendar(
      1,
      PostCalendar(
        name = "Project private Calendar 2",
        description = Some("description"),
        isPrivate = Some(true),
        timeZone = None
      ),
      projectId = Some(3)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def n8 =
    postCalendar(
      1,
      PostCalendar(name = "New Calendar", description = Some("description"), isPrivate = Some(true), timeZone = None),
      projectId = Some(1)
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n9 =
    postCalendar(
      1,
      PostCalendar(
        name = "Calendar 4",
        description = Some("description"),
        isPrivate = Some(false),
        timeZone = None
      ),
      projectId = None
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def n10 =
    postCalendar(
      1,
      PostCalendar(
        name = "Calendar 4",
        description = Some("description"),
        isPrivate = Some(false),
        timeZone = None
      ),
      projectId = None
    )(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }
}
