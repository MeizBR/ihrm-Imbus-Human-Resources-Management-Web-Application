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
import java.time.format.DateTimeFormatter

class GetLeavesSpec extends RestCallsSpec with LeaveCalls with UserCalls with Authentication with HttpClient {

  override def is: SpecStructure                          = "Specification to check the Get leave rest call".title ^ sequential ^
    s2"""
      The default workspace admin can:
        get list of all leaves                                                                                       $p1
        get a leave                                                                                                  $p2
        get all user' leaves                                                                                         $p5
        get all leaves with a specific state ( Expl: Approved )                                                      $p6

      Any workspace user can:
        get list of all leaves                                                                                       $p3
        get his own leave                                                                                            $p4
        get all user' leaves                                                                                         $p7
        get all leaves with a specific state ( Expl: Refused )                                                       $p8

      The default workspace admin cannot:
        get list of leaves with invalid workspaceId                                                                  $n1
        get list of leaves with invalid usersId                                                                      n2 // Tobe discussed: returns empty array when we enter non existing id
        get list of leaves with invalid state                                                                        n3 // Tobe discussed: returns all waiting leaves if we enter (state = "Wai")
        get a single leave with invalid leaveId                                                                      n4 // Tobe fixed: not covered -> got an error
        get a single leave with invalid workspaceId                                                                  $n5

      A workspace user cannot:
        get list of leaves with invalid workspaceId                                                                  $n6
        get list of leaves with invalid usersId                                                                      n7
        get list of leaves with invalid state                                                                        n8
        get a unowned leave                                                                                          $n9
        get an owned leave with invalid workspaceId                                                                  $n10
      """
  private def p1: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = None, state = None, from = None, to = None)(using
      workspaceAdminToken
    ) should beRight { (leaves: List[SummaryLeave]) =>
      val leave2 = leaves.head
      val leave1 = leaves.last
      leave1.id === 1 and
      leave1.start === LocalDate.parse("2023-01-01", formatter) and
      leave1.isFullDayStart === true and
      leave1.end === LocalDate.parse("2023-01-02", formatter) and
      leave1.isFullDayEnd === true and
      leave1.daysNumber === 2 and
      leave1.userId === 1 and
      leave1.leaveType === "Sick" and
      leave1.state === "Waiting" and
      leave2.id === 25 and
      leave2.start === LocalDate.parse("2022-05-01", formatter) and
      leave2.isFullDayStart === true and
      leave2.end === LocalDate.parse("2022-05-02", formatter) and
      leave2.isFullDayEnd === true and
      leave2.daysNumber === 2 and
      leave2.userId === 6 and
      leave2.leaveType === "Holiday" and
      leave2.state === "Canceled"
    }

  private def p5: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = Some(Seq(3)), state = None, from = None, to = None)(using
      workspaceAdminToken
    ) should beRight { (leaves: List[SummaryLeave]) =>
      val leave2 = leaves.head
      val leave1 = leaves.last
      leave1.id === 6 and
      leave1.start === LocalDate.parse("2022-06-01", formatter) and
      leave1.isFullDayStart === true and
      leave1.end === LocalDate.parse("2022-06-01", formatter) and
      leave1.isFullDayEnd === true and
      leave1.daysNumber === 1 and
      leave1.userId === 3 and
      leave1.leaveType === "Holiday" and
      leave1.state === "Waiting" and
      leave2.id === 10 and
      leave2.start === LocalDate.parse("2022-10-01", formatter) and
      leave2.isFullDayStart === true and
      leave2.end === LocalDate.parse("2022-10-03", formatter) and
      leave2.isFullDayEnd === true and
      leave2.daysNumber === 3 and
      leave2.userId === 3 and
      leave2.leaveType === "Sick" and
      leave2.state === "Canceled"
    }

  private def p6: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = None, state = Some("Approved"), from = None, to = None)(using
      workspaceAdminToken
    ) should beRight { (leaves: List[SummaryLeave]) =>
      val leave2 = leaves.head
      val leave1 = leaves.last
      leave1.id === 3 and
      leave1.start === LocalDate.parse("2022-03-01", formatter) and
      leave1.isFullDayStart === true and
      leave1.end === LocalDate.parse("2022-03-01", formatter) and
      leave1.isFullDayEnd === true and
      leave1.daysNumber === 1 and
      leave1.userId === 1 and
      leave1.leaveType === "Holiday" and
      leave1.state === "Approved" and
      leave2.id === 23 and
      leave2.start === LocalDate.parse("2022-03-01", formatter) and
      leave2.isFullDayStart === true and
      leave2.end === LocalDate.parse("2022-03-01", formatter) and
      leave2.isFullDayEnd === true and
      leave2.daysNumber === 1 and
      leave2.userId === 6 and
      leave2.leaveType === "Holiday" and
      leave2.state === "Approved"
    }

  private def p2: MatchResult[Result[Leave]] =
    getLeave(workspaceId = 1, leaveId = 3)(using workspaceAdminToken) should beRight { (leave: Leave) =>
      leave.id === 3 and
      leave.start === LocalDate.parse("2022-03-01", formatter) and
      leave.isFullDayStart === true and
      leave.end === LocalDate.parse("2022-03-01", formatter) and
      leave.isFullDayEnd === true and
      leave.daysNumber === 1 and
      leave.userId === 1 and
      leave.description === "Leave 3"
      leave.leaveType === "Holiday" and
      leave.state === "Approved"
    }

  private def p3: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = None, state = None, from = None, to = None)(using leadToken) should beRight {
      (leaves: List[SummaryLeave]) =>
        val leave2 = leaves.head
        val leave1 = leaves.last
        leave1.id === 1 and
        leave1.start === LocalDate.parse("2023-01-01", formatter) and
        leave1.isFullDayStart === true and
        leave1.end === LocalDate.parse("2023-01-02", formatter) and
        leave1.isFullDayEnd === true and
        leave1.daysNumber === 2 and
        leave1.userId === 1 and
        leave1.leaveType === "Sick" and
        leave1.state === "Waiting" and
        leave2.id === 25 and
        leave2.start === LocalDate.parse("2022-05-01", formatter) and
        leave2.isFullDayStart === true and
        leave2.end === LocalDate.parse("2022-05-02", formatter) and
        leave2.isFullDayEnd === true and
        leave2.daysNumber === 2 and
        leave2.userId === 6 and
        leave2.leaveType === "Holiday" and
        leave2.state === "Canceled"
    }

  private def p4: MatchResult[Result[Leave]] =
    getLeave(workspaceId = 1, leaveId = 8)(using leadToken) should beRight { (leave: Leave) =>
      leave.id === 8 and
      leave.start === LocalDate.parse("2022-08-01", formatter) and
      leave.isFullDayStart === true and
      leave.end === LocalDate.parse("2022-08-02", formatter) and
      leave.isFullDayEnd === true and
      leave.daysNumber === 2 and
      leave.userId === 3 and
      leave.description === "Leave 8"
      leave.leaveType === "Holiday" and
      leave.state === "Approved"
    }

  private def p7: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = Some(Seq(3)), state = None, from = None, to = None)(using
      supervisorToken
    ) should beRight { (leaves: List[SummaryLeave]) =>
      val leave2 = leaves.head
      val leave1 = leaves.last
      leave1.id === 6 and
      leave1.start === LocalDate.parse("2022-06-01", formatter) and
      leave1.isFullDayStart === true and
      leave1.end === LocalDate.parse("2022-06-01", formatter) and
      leave1.isFullDayEnd === true and
      leave1.daysNumber === 1 and
      leave1.userId === 3 and
      leave1.leaveType === "Holiday" and
      leave1.state === "Waiting" and
      leave2.id === 10 and
      leave2.start === LocalDate.parse("2022-10-01", formatter) and
      leave2.isFullDayStart === true and
      leave2.end === LocalDate.parse("2022-10-03", formatter) and
      leave2.isFullDayEnd === true and
      leave2.daysNumber === 3 and
      leave2.userId === 3 and
      leave2.leaveType === "Sick" and
      leave2.state === "Canceled"
    }

  private def p8: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = None, state = Some("Refused"), from = None, to = None)(using
      supervisorToken
    ) should beRight { (leaves: List[SummaryLeave]) =>
      val leave2 = leaves.head
      val leave1 = leaves.last
      leave1.id === 4 and
      leave1.start === LocalDate.parse("2022-04-01", formatter) and
      leave1.isFullDayStart === true and
      leave1.end === LocalDate.parse("2022-04-04", formatter) and
      leave1.isFullDayEnd === true and
      leave1.daysNumber === 4 and
      leave1.userId === 1 and
      leave1.leaveType === "Holiday" and
      leave1.state === "Refused" and
      leave2.id === 24 and
      leave2.start === LocalDate.parse("2022-04-01", formatter) and
      leave2.isFullDayStart === true and
      leave2.end === LocalDate.parse("2022-04-04", formatter) and
      leave2.isFullDayEnd === true and
      leave2.daysNumber === 4 and
      leave2.userId === 6 and
      leave2.leaveType === "Holiday" and
      leave2.state === "Refused"
    }

  private def n1: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 404, usersId = None, state = None, from = None, to = None)(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = Some(Seq(404)), state = None, from = None, to = None)(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n3: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = None, state = Some("Wai"), from = None, to = None)(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Invalid enumeration value.")
    }

  private def n4: MatchResult[Result[Leave]] =
    getLeave(workspaceId = 1, leaveId = 404)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound and
        response._2 === Failure("Not found.")
    }

  private def n5: MatchResult[Result[Leave]] =
    getLeave(workspaceId = 404, leaveId = 1)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n6: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 404, usersId = None, state = None, from = None, to = None)(using leadToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n7: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = Some(Seq(404)), state = None, from = None, to = None)(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n8: MatchResult[Result[List[SummaryLeave]]] =
    getLeaves(workspaceId = 1, usersId = None, state = Some("Wai"), from = None, to = None)(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Unable to update leave status or Invalid enumeration value.")
    }

  private def n9: MatchResult[Result[Leave]] =
    getLeave(workspaceId = 1, leaveId = 17)(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n10: MatchResult[Result[Leave]] =
    getLeave(workspaceId = 404, leaveId = 1)(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
