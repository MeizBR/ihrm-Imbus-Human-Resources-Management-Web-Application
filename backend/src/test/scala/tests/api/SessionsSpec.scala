package tests.api

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.sessions.UserSession
import org.specs2.specification.core.SpecStructure
import utils.{Authentication, HttpClient}
import utils.Calls.SessionCalls
import utils.RestErrorFactory.Failure

class SessionsSpec extends RestCallsSpec with SessionCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the session calls".title ^ sequential ^
    s2"""
        Any workspace user can:
            Get his current session                                                                   $p1

        Any workspace user cannot:
            Get the session with invalid WorkspaceId                                                  $n1
            Get the session with invalid token                                                        $n2
      """

  private def p1 = getSession(1)(using workspaceAdminToken) should beRight { (userSession: UserSession) =>
    userSession.token === workspaceAdminSession.token and
    userSession.workspaceId === workspaceAdminSession.workspaceId and
    userSession.userId === workspaceAdminSession.userId and
    userSession.globalRoles === workspaceAdminSession.globalRoles
  }

  private def n1 = getSession(-50)(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
  }

  private def n2 = getSession(1)(using "invalidToken") should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
  }
}
