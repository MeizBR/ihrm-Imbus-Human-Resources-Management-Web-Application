package utils

import api.generated.sessions.{PostAdminSession, PostUserSession, UserSession}
import utils.Calls.SessionCalls

import java.time.format.DateTimeFormatter

trait Authentication extends SessionCalls {
  self: HttpClient =>

  import HttpClient._

  Thread.sleep(1000)
  lazy val superAdminToken: String            = loginSuperAdmin(PostAdminSession("super-admin", "admin")).get
  lazy val workspaceAdminSession: UserSession = loginUser(PostUserSession("imbus", "admin", "admin")).get
  lazy val leadSession: UserSession           = loginUser(PostUserSession("imbus", "lead", "lead")).get
  lazy val supervisorSession: UserSession     = loginUser(PostUserSession("imbus", "supervisor", "supervisor")).get
  lazy val userSession: UserSession           = loginUser(PostUserSession("imbus", "member", "member")).get
  lazy val otherUserSession: UserSession      = loginUser(PostUserSession("imbus", "member.login", "member")).get
  lazy val workspaceAdminToken: String        = workspaceAdminSession.token
  lazy val userToken: String                  = userSession.token
  lazy val otherUserToken: String             = otherUserSession.token
  lazy val leadToken: String                  = leadSession.token
  lazy val supervisorToken: String            = supervisorSession.token
  lazy val formatter: DateTimeFormatter       = DateTimeFormatter.ofPattern("yyyy-MM-dd")
}
