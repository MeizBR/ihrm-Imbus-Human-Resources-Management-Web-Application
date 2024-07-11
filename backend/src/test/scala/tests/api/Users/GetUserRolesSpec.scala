package tests.api.Users

import api.enumeration.GlobalRole
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.{UserCalls, WorkspaceCalls}

class GetUserRolesSpec extends RestCallsSpec with UserCalls with WorkspaceCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the get users roles rest calls".title
  s2"""
     The default workspace admin can:
        get user roles                                                                                    $p1
        get user roles after edit                                                                         $p2

     The default super admin can:
        get user roles                                                                                    $p3
        get user roles after edit                                                                         $p4

      """
  private def p1                 = getUserRoles(1, 5)(using workspaceAdminToken) should beRight { (roles: List[String]) =>
    roles.length === 0
  }

  private def p2 = getUserRoles(1, 1)(using workspaceAdminToken) should beRight { (roles: List[String]) =>
    val firstRole = roles.head
    firstRole === "Administrator"
  }

  private def p3 =
    getUserRolesBySuperAdmin(1, 6)(using superAdminToken) should beRight { (roles: List[GlobalRole]) =>
      roles.length === 0
    }

  private def p4 = getUserRolesBySuperAdmin(1, 1)(using superAdminToken) should beRight { (roles: List[GlobalRole]) =>
    val firstRole = roles.head.toString
    firstRole === "Administrator"
  }
}
