package tests.api.Leaves

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.leaves._
import org.specs2.matcher.MatchResult
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.{LeaveCalls, UserCalls}
import utils.HttpClient.Result
import utils.RestErrorFactory.Failure
import java.time.LocalDate

class PostLeaveSpec extends RestCallsSpec with LeaveCalls with UserCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the Post leave rest call".title ^ sequential ^
    s2"""
     The default workspace admin can:
       create a leave for himself                                                                                   $p1
       create a leave for another user                                                                              $p2

     Any workspace user can:
       create a leave for himself                                                                                   $p3

     The default workspace admin cannot:
       create a leave for another user when he has another leave with the same start date                           $n1
       create a leave when the start date is after the end date                                                     $n2
       create a leave with same start and end dates but isFullDayStart and isFullDayEnd are different               $n3
       create a leave with invalid workspaceId                                                                      $n4
       create a leave for a not existing user                                                                       $n5

     A workspace user cannot:
       create a leave for another user                                                                              $n6
       create a leave when he has another leave with the same start date                                            $n7
       create a leave when the start date is after the end date                                                     $n8
       create a leave with invalid workspaceId                                                                      $n9
       create a leave when the start date is after the end date                                                     $n10
       create a leave when the start and the end date are equal but isFullDayStart and isFullDayEnd are different   $n11
     """

  private def p1: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(1),
      leave = PostLeave(
        LocalDate.parse("2021-06-15", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-06-17", formatter),
        isFullDayEnd = true,
        2,
        "Holiday",
        "New description",
        Some("Waiting")
      )
    )(using
      workspaceAdminToken
    ) should beRight { (leave: Leave) =>
      leave.start === LocalDate.parse("2021-06-15", formatter) and
      leave.isFullDayStart === true and
      leave.end === LocalDate.parse("2021-06-17", formatter) and
      leave.isFullDayEnd === true and
      leave.daysNumber === 2 and
      leave.userId === 1 and
      leave.description === "New description"
      leave.leaveType === "Holiday" and
      leave.state === "Waiting"
    }

  private def p2: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(4),
      leave = PostLeave(
        LocalDate.parse("2021-09-15", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-09-17", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      workspaceAdminToken
    ) should beRight { (leave: Leave) =>
      leave.start === LocalDate.parse("2021-09-15", formatter) and
      leave.isFullDayStart === true and
      leave.end === LocalDate.parse("2021-09-17", formatter) and
      leave.isFullDayEnd === true and
      leave.daysNumber === 2 and
      leave.userId === 4 and
      leave.description === "New description"
      leave.leaveType === "Sick" and
      leave.state === "Waiting"
    }

  private def p3: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = None,
      leave = PostLeave(
        LocalDate.parse("2021-06-22", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-06-23", formatter),
        isFullDayEnd = true,
        1,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      supervisorToken
    ) should beRight { (leave: Leave) =>
      leave.start === LocalDate.parse("2021-06-22", formatter) and
      leave.isFullDayStart === true and
      leave.end === LocalDate.parse("2021-06-23", formatter) and
      leave.isFullDayEnd === true and
      leave.daysNumber === 1 and
      leave.userId === 4 and
      leave.description === "New description"
      leave.leaveType === "Sick" and
      leave.state === "Waiting"
    }

  private def n1: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(4),
      leave = PostLeave(
        LocalDate.parse("2021-06-22", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-06-22", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict and
      response._2 === Failure("Unable to create leave (There is another leave on this date).")
    }

  private def n2: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(4),
      leave = PostLeave(
        LocalDate.parse("2021-09-19", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-09-17", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
      response._2 === Failure("Start date should be before end date.")
    }

  private def n3: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(4),
      leave = PostLeave(
        LocalDate.parse("2021-09-17", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-09-17", formatter),
        isFullDayEnd = false,
        2,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Start and end dates must be both full or half.")
    }

  private def n4: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 5,
      userId = Some(4),
      leave = PostLeave(
        LocalDate.parse("2021-09-15", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-09-17", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n5: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(404),
      leave = PostLeave(
        LocalDate.parse("2021-09-15", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-09-17", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n6: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(3),
      leave = PostLeave(
        LocalDate.parse("2021-08-15", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-08-17", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("")
      )
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n7: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(4),
      leave = PostLeave(
        LocalDate.parse("2021-06-22", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-06-22", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict and
      response._2 === Failure("Unable to create leave (There is another leave on this date).")
    }

  private def n8: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = None,
      leave = PostLeave(
        LocalDate.parse("2021-04-16", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-04-15", formatter),
        isFullDayEnd = true,
        1,
        "Sick",
        "New description",
        Some("")
      )
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Start date should be before end date.")
    }

  private def n9: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 5,
      userId = None,
      leave = PostLeave(
        LocalDate.parse("2021-06-15", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-06-17", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n10: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = None,
      leave = PostLeave(
        LocalDate.parse("2020-12-08", formatter),
        isFullDayStart = true,
        LocalDate.parse("2020-12-06", formatter),
        isFullDayEnd = true,
        2,
        "Holiday",
        "Leave is Refused by the administration",
        Some("Waiting")
      )
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Start date should be before end date.")
    }

  def n11: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = None,
      leave = PostLeave(
        LocalDate.parse("2020-12-06", formatter),
        isFullDayStart = true,
        LocalDate.parse("2020-12-06", formatter),
        isFullDayEnd = false,
        1,
        "Holiday",
        "Leave is Refused by the administration",
        Some("Waiting")
      )
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Start and end dates must be both full or half.")
    }
}
