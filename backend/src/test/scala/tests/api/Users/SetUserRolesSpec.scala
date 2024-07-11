package tests.api.Users

import api.enumeration.GlobalRole
import org.specs2.specification.core.SpecStructure
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.matcher.MatchResult
import utils.RestErrorFactory.Failure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.{UserCalls, WorkspaceCalls}
import utils.HttpClient.Result

class SetUserRolesSpec extends RestCallsSpec with UserCalls with WorkspaceCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the put user rest calls".title ^ sequential ^
    s2"""
     The default workspace admin can:
        edit user roles                                                                                   $p1

     The default workspace admin cannot:
        edit user roles with a non existing workspaceId                                                   $n1
        edit a user roles with a non existing userId                                                      $n3

     The default super admin can:
        edit user roles                                                                                   $p2

     The default super admin cannot:
	     edit user roles with a non existing workspaceId                                                  $n2
       edit a user roles with a non existing userId                                                       $n4
      """

  private val listRoles: List[GlobalRole] = List(GlobalRole.Administrator, GlobalRole.AccountManager)

  private def p1: MatchResult[Result[List[GlobalRole]]] =
    putUserRoles(workspaceId = 1, userId = 1, roles = listRoles)(using workspaceAdminToken) should beRight {
      (roles: List[GlobalRole]) =>
        val firstRole = roles.head.toString
        val lastRole  = roles.last.toString
        firstRole === "Administrator" and
        lastRole === "AccountManager"
    }

  private def p2: MatchResult[Result[List[GlobalRole]]] =
    putUserRolesBySuperAdmin(workspaceId = 1, userId = 2, roles = listRoles)(using superAdminToken) should beRight {
      (roles: List[GlobalRole]) =>
        val firstRole = roles.head.toString
        val lastRole  = roles.last.toString
        firstRole === "Administrator" and
        lastRole === "AccountManager"
    }

  private def n1: MatchResult[Result[List[GlobalRole]]] =
    putUserRoles(workspaceId = 404, userId = 1, roles = listRoles)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2: MatchResult[Result[List[GlobalRole]]] =
    putUserRolesBySuperAdmin(workspaceId = 404, userId = 2, roles = listRoles)(using superAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound
        response._2 === Failure("Workspace not found.")
    }

  private def n3: MatchResult[Result[List[GlobalRole]]] =
    putUserRoles(workspaceId = 1, userId = 404, roles = listRoles)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound
        response._2 === Failure("Not found.")
    }

  private def n4: MatchResult[Result[List[GlobalRole]]] =
    putUserRolesBySuperAdmin(workspaceId = 1, userId = 404, roles = listRoles)(using superAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.NotFound
        response._2 === Failure("User not found.")
    }
}
