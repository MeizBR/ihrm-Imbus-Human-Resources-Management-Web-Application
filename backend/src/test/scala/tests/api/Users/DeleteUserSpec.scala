package tests.api.Users

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.matcher.MatchResult
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.{UserCalls, WorkspaceCalls}
import utils.HttpClient.Result

class DeleteUserSpec extends RestCallsSpec with UserCalls with WorkspaceCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the delete user rest calls".title ^ sequential ^
    s2"""
     The default workspace admin can:
        delete a user                                                                                     $p1

     The default workspace admin cannot:
        delete a user with invalid workspaceId                                                            $n1
        delete a user with invalid userId                                                                 $n2
        delete him self                                                                                   $n5

     The default super admin can:
        delete a user                                                                                     $p2

     The default super admin cannot:
        delete a user with invalid id                                                                     $n3
        delete a user with invalid workspaceId                                                            $n4
      """

  private def p1: MatchResult[Result[String]] =
    deleteUser(workspaceId = 1, userId = 6)(using workspaceAdminToken) should beRight

  private def p2: MatchResult[Result[String]] =
    deleteUserBySuperAdmin(workspaceId = 1, userId = 5)(using superAdminToken) should beRight

  private def n1: MatchResult[Result[String]] =
    deleteUser(workspaceId = 404, userId = 5)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2: MatchResult[Result[String]] =
    deleteUser(workspaceId = 1, userId = 404)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound and
        response._2 === Failure("Not found.")
    }

  private def n3: MatchResult[Result[String]] =
    deleteUserBySuperAdmin(workspaceId = 1, userId = 404)(using superAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound and
        response._2 === Failure("User not found.")
    }

  private def n4: MatchResult[Result[String]] =
    deleteUserBySuperAdmin(workspaceId = 404, userId = 4)(using superAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound and
        response._2 === Failure("Workspace not found.")
    }
  private def n5: MatchResult[Result[String]] =
    deleteUser(workspaceId = 1, userId = 1)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }
}
