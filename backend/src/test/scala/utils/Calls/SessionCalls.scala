package utils.Calls

import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.sessions.{PostAdminSession, PostUserSession, UserSession}
import utils.HttpClient

trait SessionCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String = "http://localhost:9000"

  private def workspaceSessionRoute(workspaceId: Int) = s"$route/api/workspaces/$workspaceId/session"

  private val superAdminLoginRoute    = s"$route/api/admin/session"
  private val workspaceUserLoginRoute = s"$route/api/workspaces/session"

  def getSession(workspaceId: Int)(using token: String): Result[UserSession] =
    response(HttpMethods.GET, workspaceSessionRoute(workspaceId), Option(token)).decoded[UserSession]

  def loginSuperAdmin(session: PostAdminSession): Result[String] = {
    println("login super admin =========+++++>")
    response(HttpMethods.POST, superAdminLoginRoute, session, None).decoded[String]
  }

  def loginUser(session: PostUserSession): Result[UserSession] = {
    println("login workspace admin =========+++++>")
    println(response(HttpMethods.POST, workspaceUserLoginRoute, session, None).decoded[UserSession])
    response(HttpMethods.POST, workspaceUserLoginRoute, session, None).decoded[UserSession]

  }

  def logoutUser(workspaceId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, workspaceSessionRoute(workspaceId), Option(token)).raw
}
