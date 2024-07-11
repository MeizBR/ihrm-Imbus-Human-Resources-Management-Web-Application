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
import java.time.format.DateTimeFormatter

class PutLeaveSpec extends RestCallsSpec with LeaveCalls with UserCalls with Authentication with HttpClient {

  override def is: SpecStructure             = "Specification to check the Put leave rest call".title ^ sequential ^
    s2"""
     The default workspace admin can:
       update a leave state and comment ( from Waiting to InProgress)                                               $p1
       update a leave state and comment for another user leave ( from Waiting to InProgress)                        $p2
       update a leave state and comment for another user leave ( from Waiting to Approved)                          $p3
       update a leave state and comment for another user leave ( from InProgress to Refused)                        $p4
       update a leave state and comment for another user leave ( from InProgress to Waiting)                        $p5
       update a leave state and comment for another user leave ( from Waiting to Refused)                           $p6
       update a leave state and comment for another user leave ( from InProgress to Approved)                       $p7
       update a leave comment for another user leave ( current state is Canceled )                                  $p8
       update a leave comment for another user leave ( current state is Approved )                                  $p9
       update a leave comment for another user leave ( current state is Refused )                                   $p10
       update a leave state and comment for another user leave ( from Approved to Waiting)                          $p11
       update a leave state and comment for another user leave ( from Refused to Waiting)                           $p12
       cancel his own leave which is waiting                                                                        $p13
       cancel his own leave which is in progress                                                                    $p14

     Any workspace user can:
       update an owned leave state ( from Waiting to Canceled )                                                     $p15
       update an owned leave state ( from InProgress to Canceled )                                                  $p16

     The default workspace admin cannot:
       update a leave state ( from Canceled to Waiting)                                                             $n1
       update a leave with invalid leaveId                                                                          $n2
       update a leave with invalid workspaceId                                                                      $n3
       update a leave from any state to Canceled                                                                    $n4

     A workspace user cannot:
       update a leave state ( from Waiting to InProgress)                                                           $n5
       update a leave state ( from Waiting to Approved)                                                             $n6
       update a leave state ( from Waiting to Refused)                                                              $n7
       update a leave state ( from Canceled to Waiting)                                                             $n8
       update a leave with invalid leaveId                                                                          $n9
       update a leave with invalid workspaceId                                                                      $n10
     """
  private def p1: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 1,
    leave = PutLeave(Some("InProgress"), Some("This comment space is reserved for administration."))
  )(using workspaceAdminToken) should beRight { (leave: Leave) =>
    leave.state === "InProgress" and leave.comment === "This comment space is reserved for administration."
  }

  private def p2: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 6,
    leave = PutLeave(Some("InProgress"), Some("This comment space is reserved for administration"))
  )(using workspaceAdminToken) should beRight { (leave: Leave) =>
    leave.state === "InProgress" and leave.comment === "This comment space is reserved for administration"
  }

  private def p3: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 16,
    leave = PutLeave(Some("Approved"), Some("This comment space is reserved for administration"))
  )(using workspaceAdminToken) should beRight { (leave: Leave) =>
    leave.state === "Approved" and leave.comment === "This comment space is reserved for administration"
  }

  private def p4: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 6,
    leave = PutLeave(Some("Refused"), Some("This comment space is reserved for administration"))
  )(using workspaceAdminToken) should beRight { (leave: Leave) =>
    leave.state === "Refused" and leave.comment === "This comment space is reserved for administration"
  }

  private def p5: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 17,
    leave = PutLeave(Some("Waiting"), Some("This comment space is reserved for administration"))
  )(using workspaceAdminToken) should beRight { (leave: Leave) =>
    leave.state === "Waiting" and leave.comment === "This comment space is reserved for administration"
  }

  private def p6: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 17,
    leave = PutLeave(Some("Refused"), Some("This comment space is reserved for administration"))
  )(using workspaceAdminToken) should beRight { (leave: Leave) =>
    leave.state === "Refused" and leave.comment === "This comment space is reserved for administration"
  }

  private def p7: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 12,
    leave = PutLeave(Some("Approved"), Some("This comment space is reserved for administration"))
  )(using workspaceAdminToken) should beRight { (leave: Leave) =>
    leave.state === "Approved" and leave.comment === "This comment space is reserved for administration"
  }

  private def p8: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 15,
      leave = PutLeave(None, Some("This comment space is reserved for administration"))
    )(using
      workspaceAdminToken
    ) should beRight { (leave: Leave) =>
      leave.state === "Canceled" and leave.comment === "This comment space is reserved for administration"
    }

  private def p9: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 13,
      leave = PutLeave(None, Some("This comment space is reserved for administration"))
    )(using
      workspaceAdminToken
    ) should beRight { (leave: Leave) =>
      leave.state === "Approved" and leave.comment === "This comment space is reserved for administration"
    }

  private def p10: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 14,
      leave = PutLeave(None, Some("This comment space is reserved for administration"))
    )(using
      workspaceAdminToken
    ) should beRight { (leave: Leave) =>
      leave.state === "Refused" and leave.comment === "This comment space is reserved for administration"
    }

  private def p11: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 13,
      leave = PutLeave(Some("Waiting"), Some(""))
    )(using workspaceAdminToken) should beRight { (leave: Leave) =>
      leave.state === "Waiting" and leave.comment === ""
    }

  private def p12: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 14,
      leave = PutLeave(Some("Waiting"), Some(""))
    )(using workspaceAdminToken) should beRight { (leave: Leave) =>
      leave.state === "Waiting" and leave.comment === ""
    }
////////////
  private def p13: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 1,
      leave = PutLeave(Some("Canceled"), Some(""))
    )(using workspaceAdminToken) should beRight { (leave: Leave) =>
      leave.state === "Canceled" and leave.comment === ""
    }

  private def p14: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 2,
      leave = PutLeave(Some("Canceled"), Some(""))
    )(using workspaceAdminToken) should beRight { (leave: Leave) =>
      leave.state === "Canceled" and leave.comment === ""
    }

  private def p15: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 11,
    leave = PutLeave(Some("Canceled"), None)
  )(using supervisorToken) should beRight { (leave: Leave) =>
    leave.state === "Canceled"
  }

  private def p16: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 7,
    leave = PutLeave(Some("Canceled"), None)
  )(using leadToken) should beRight { (leave: Leave) =>
    leave.state === "Canceled"
  }

  private def n1: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 10,
    leave = PutLeave(Some("Waiting"), None)
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Unable to update leave (leave is Canceled).")
  }

  private def n2: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 404,
    leave = PutLeave(None, None)
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound and
    response._2 === Failure("Not found.")
  }

  private def n3: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 404,
    leaveId = 3,
    leave = PutLeave(None, None)
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n4: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 10,
    leave = PutLeave(Some("Canceled"), None)
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Unable to cancel this leave, you are not the owner.")
  }

  private def n5: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 21,
      leave = PutLeave(Some("InProgress"), Some("New Comment"))
    )(using otherUserToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Unable to update leave status or Invalid enumeration value.")
    }

  private def n6: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 21,
      PutLeave(Some("Approved"), Some("New Comment"))
    )(using otherUserToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Unable to update leave status or Invalid enumeration value.")
    }

  private def n7: MatchResult[Result[Leave]] =
    putLeave(
      workspaceId = 1,
      leaveId = 21,
      PutLeave(Some("Refused"), Some("New Comment"))
    )(using otherUserToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity and
      response._2 === Failure("Unable to update leave status or Invalid enumeration value.")
    }

  private def n8: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 25,
    leave = PutLeave(Some("Waiting"), None)
  )(using otherUserToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.UnprocessableEntity and
    response._2 === Failure("Unable to update leave status or Invalid enumeration value.")
  }

  private def n9: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 1,
    leaveId = 404,
    leave = PutLeave(None, None)
  )(using otherUserToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n10: MatchResult[Result[Leave]] = putLeave(
    workspaceId = 404,
    leaveId = 3,
    leave = PutLeave(None, None)
  )(using otherUserToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }
}
