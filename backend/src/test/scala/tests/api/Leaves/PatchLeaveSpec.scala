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

class PatchLeaveSpec extends RestCallsSpec with LeaveCalls with UserCalls with Authentication with HttpClient {

  override def is: SpecStructure             = "Specification to check the Post leave rest call".title ^ sequential ^
    s2"""
     The default workspace admin can:
       edit a leave ( all attributes | current state is Waiting )                                                   $p1
       edit a leave ( only description | current state is InProgress )                                              $p2

     Any workspace user can:
       edit his own leave ( all attributes | current state is Waiting )                                             $p3
       edit a leave ( only description | current state is InProgress )                                              $p4

     The default workspace admin cannot:
       edit a leave ( current state is Canceled )                                                                   $n1
       edit a leave ( current state is Approved )                                                                   $n2
       edit a leave ( current state is Refused )                                                                    $n3
       edit a leave when the start date is after the end date                                                       $n4
       edit a leave with same start and end dates but isFullDayStart and isFullDayEnd are different                 $n5
       edit a leave with invalid leaveId                                                                            $n6
       edit a leave with invalid state                                                                              n7//fix me
       edit a leave with invalid workspaceId                                                                        $n13

     A workspace user cannot:
       edit a leave when the start date is after the end date                                                       $n8
       edit a leave with invalid leaveId                                                                            $n9
       edit a leave when the start and the end date are equal but isFullDayStart and isFullDayEnd are different     $n10
       edit a leave with invalid state                                                                              $n11
       edit a leave with invalid workspaceId                                                                        $n12
     """
  private def p1: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 1,
      leave = PatchLeave(
        Some(LocalDate.parse("2022-01-01", formatter)),
        Some(true),
        Some(LocalDate.parse("2022-01-02", formatter)),
        Some(true),
        Some(2),
        Some("Holiday"),
        Some("Updated description.")
      )
    )(using
      workspaceAdminToken
    ) should beRight { (leave: Leave) =>
      leave.description === "Updated description." and
      leave.start === LocalDate.parse("2022-01-01", formatter) and
      leave.end === LocalDate.parse("2022-01-02", formatter) and leave.userId === 1 and
      leave.leaveType === "Holiday" and leave.isFullDayStart === true and
      leave.isFullDayEnd === true and leave.daysNumber === 2 and leave.comment === "Leave is Waiting."
    }

  private def p2: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 2,
      leave = PatchLeave(
        None,
        None,
        None,
        None,
        None,
        None,
        Some("Updated description.")
      )
    )(using
      workspaceAdminToken
    ) should beRight { (leave: Leave) =>
      leave.description === "Updated description." and
      leave.start === LocalDate.parse("2023-02-01", formatter) and
      leave.end === LocalDate.parse("2023-02-03", formatter) and leave.userId === 1 and
      leave.leaveType === "Sick" and leave.isFullDayStart === true and
      leave.isFullDayEnd === true and leave.daysNumber === 3 and leave.comment === "Leave is InProgress."
    }

  private def p3: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 11,
      leave = PatchLeave(
        Some(LocalDate.parse("2022-11-01", formatter)),
        Some(true),
        Some(LocalDate.parse("2022-11-01", formatter)),
        Some(true),
        Some(1),
        Some("Holiday"),
        Some("I feed not good and i have a headache.")
      )
    )(using
      supervisorToken
    ) should beRight { (leave: Leave) =>
      leave.description === "I feed not good and i have a headache." and
      leave.start === LocalDate.parse("2022-11-01", formatter) and
      leave.end === LocalDate.parse("2022-11-01", formatter) and leave.userId === 4 and
      leave.leaveType === "Holiday" and leave.isFullDayStart === true and
      leave.isFullDayEnd === true and leave.daysNumber === 1
    }

  private def p4: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 12,
      leave = PatchLeave(
        None,
        None,
        None,
        None,
        None,
        None,
        Some("Updated description by supervisor after updating state to InProgress")
      )
    )(using
      supervisorToken
    ) should beRight { (leave: Leave) =>
      leave.description === "Updated description by supervisor after updating state to InProgress" and
      leave.start === LocalDate.parse("2022-12-01", formatter) and
      leave.end === LocalDate.parse("2022-12-04", formatter) and leave.userId === 4 and
      leave.leaveType === "Sick" and leave.isFullDayStart === true and
      leave.isFullDayEnd === true and leave.daysNumber === 4 and leave.comment === "Leave is InProgress."
    }

  private def n1: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 15,
      leave = PatchLeave(
        Some(LocalDate.parse("2020-03-01", formatter)),
        Some(true),
        Some(LocalDate.parse("2020-03-02", formatter)),
        Some(true),
        Some(1),
        Some("Holiday"),
        Some("Leave is Canceled by the owned")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Unable to update leave (leave is Canceled).")
    }

  private def n2: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 3,
      leave = PatchLeave(
        Some(LocalDate.parse("2021-04-23", formatter)),
        Some(true),
        Some(LocalDate.parse("2021-05-03", formatter)),
        Some(true),
        Some(11),
        Some("Holiday"),
        Some("Leave is Approved by the administration")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Unable to update leave (leave is Approved).")
    }

  private def n3: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 9,
      leave = PatchLeave(
        Some(LocalDate.parse("2020-12-03", formatter)),
        Some(true),
        Some(LocalDate.parse("2020-12-06", formatter)),
        Some(true),
        Some(3),
        Some("Holiday"),
        Some("Leave is Refused by the administration")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Unable to update leave (leave is Refused).")
    }

  private def n4: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 6,
      leave = PatchLeave(
        Some(LocalDate.parse("2020-12-19", formatter)),
        Some(true),
        Some(LocalDate.parse("2020-12-18", formatter)),
        Some(true),
        Some(3),
        Some("Holiday"),
        Some("")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity
      response._2 === Failure("Start date should be before end date.")
    }

  private def n5: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 6,
      leave = PatchLeave(
        Some(LocalDate.parse("2020-12-18", formatter)),
        Some(true),
        Some(LocalDate.parse("2020-12-18", formatter)),
        Some(false),
        Some(1),
        Some("Holiday"),
        Some("")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Start and end dates must be both full or half.")
    }

  private def n6: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 404,
      leave = PatchLeave(
        Some(LocalDate.parse("2020-12-03", formatter)),
        Some(true),
        Some(LocalDate.parse("2020-12-06", formatter)),
        Some(true),
        Some(3),
        Some("Holiday"),
        Some("Leave is Refused by the administration")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n7: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 1,
      leave = PutLeave(Some("InPro"), Some("New Comment"))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Invalid enumeration value.")
    }

  private def n8: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 11,
      leave = PatchLeave(
        Some(LocalDate.parse("2020-12-19", formatter)),
        Some(true),
        Some(LocalDate.parse("2020-12-18", formatter)),
        Some(true),
        Some(3),
        Some("Holiday"),
        Some("")
      )
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity
      response._2 === Failure("Start date should be before end date.")
    }

  private def n9: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 404,
      leave = PatchLeave(
        Some(LocalDate.parse("2020-12-03", formatter)),
        Some(true),
        Some(LocalDate.parse("2020-12-06", formatter)),
        Some(true),
        Some(3),
        Some("Holiday"),
        Some("Leave is Refused by the administration")
      )
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n10: MatchResult[Result[Leave]] =
    patchLeave(
      workspaceId = 1,
      leaveId = 11,
      leave = PatchLeave(
        Some(LocalDate.parse("2020-12-18", formatter)),
        Some(true),
        Some(LocalDate.parse("2020-12-18", formatter)),
        Some(false),
        Some(1),
        Some("Holiday"),
        Some("")
      )
    )(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Start and end dates must be both full or half.")
    }

  private def n11: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 11,
      leave = PutLeave(Some("Wai"), Some("New Comment"))
    )(using supervisorToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Unable to update leave status or Invalid enumeration value.")
    }

  private def n12: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 404,
      leaveId = 11,
      leave = PutLeave(Some("Waiting"), Some("New Comment"))
    )(using supervisorToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n13: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 404,
      leaveId = 11,
      leave = PutLeave(Some("Waiting"), Some("New Comment"))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
