package tests.api.Users

import api.generated.users.User
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.{UserCalls, WorkspaceCalls}

class GetUsersSpec extends RestCallsSpec with UserCalls with WorkspaceCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the get users rest calls".title ^ sequential ^
    s2"""
     The default workspace admin can:
        get a user                                                                                        $p2

     The default super admin can:
        get a user                                                                                        $p10
      """
  private def p2                 = getUsers(1)(using workspaceAdminToken) should beRight { (users: List[User]) =>
    val user1 = users.last
    user1.firstName === "Said" and user1.lastName === "Med Bechir" and
    user1.login === "member.login" and
    user1.note === "" and
    user1.email === "member.email@gmail.com" and user1.isActive === true
  }

  private def p10 = getUsersBySuperAdmin(1)(using superAdminToken) should beRight { (users: List[User]) =>
    val user1 = users.last
    user1.firstName === "Said" and user1.lastName === "Med Bechir" and
    user1.login === "member.login"
    user1.email === "member.email@gmail.com" and
    user1.note === "" and user1.isActive === true
  }
}
