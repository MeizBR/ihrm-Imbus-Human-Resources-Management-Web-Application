package utils.Calls

import api.enumeration.GlobalRole
import api.enumeration._
import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.users.{PatchUser, PatchUserBySuperAdmin, PostUser, User}
import utils.HttpClient

trait UserCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String = "http://localhost:9000"

  // Note: Super admin routes

  private def usersSuperAdminRoute(workspaceId: Int) = s"$route/api/admin/workspaces/$workspaceId/users"

  private def userSuperAdminRoute(workspaceId: Int, userId: Int) = s"${usersSuperAdminRoute(workspaceId)}/$userId"

  private def userRolesSuperAdminRoute(workspaceId: Int, userId: Int) =
    s"${userSuperAdminRoute(workspaceId, userId)}/roles"

  // Note: Workspace admin routes

  private def usersWorkspaceAdminRoute(workspaceId: Int) = s"$route/api/workspaces/$workspaceId/users"

  private def userWorkspaceAdminRoute(workspaceId: Int, userId: Int) =
    s"${usersWorkspaceAdminRoute(workspaceId)}/$userId"

  private def userRolesWorkspaceAdminRoute(workspaceId: Int, userId: Int) =
    s"${userWorkspaceAdminRoute(workspaceId, userId)}/roles"

  // Note: Super admin calls

  def postUserBySuperAdmin(workspaceId: Int, user: PostUser)(using token: String): Result[User] =
    response(HttpMethods.POST, usersSuperAdminRoute(workspaceId), user, Option(token)).decoded[User]

  def getUsersBySuperAdmin(workspaceId: Int)(using token: String): Result[List[User]] =
    response(HttpMethods.GET, usersSuperAdminRoute(workspaceId), Option(token)).decoded[List[User]]

  def patchUserBySuperAdmin(workspaceId: Int, userId: Int, patch: PatchUserBySuperAdmin)(using
      token: String
  ): Result[User] =
    response(HttpMethods.PATCH, userSuperAdminRoute(workspaceId, userId), patch, Option(token)).decoded[User]

  def deleteUserBySuperAdmin(workspaceId: Int, userId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, userSuperAdminRoute(workspaceId, userId), Option(token)).raw

  def putUserRolesBySuperAdmin(workspaceId: Int, userId: Int, roles: List[GlobalRole])(using
      token: String
  ): Result[List[GlobalRole]] =
    response(HttpMethods.PUT, userRolesSuperAdminRoute(workspaceId, userId), roles, Option(token))
      .decoded[List[GlobalRole]]

  def getUserRolesBySuperAdmin(workspaceId: Int, userId: Int)(using token: String): Result[List[GlobalRole]] =
    response(HttpMethods.GET, userRolesSuperAdminRoute(workspaceId, userId), Option(token)).decoded[List[GlobalRole]]

  // Note: Workspace admin calls

  def postUser(workspaceId: Int, user: PostUser)(using token: String): Result[User] =
    response(HttpMethods.POST, usersWorkspaceAdminRoute(workspaceId), user, Option(token)).decoded[User]

  def getUsers(workspaceId: Int)(using token: String): Result[List[User]] =
    response(HttpMethods.GET, usersWorkspaceAdminRoute(workspaceId), Option(token)).decoded[List[User]]

  def patchUser(workspaceId: Int, userId: Option[Int] = None, patch: PatchUser)(using
      token: String
  ): Result[User] =
    response(
      HttpMethods.PATCH,
      usersWorkspaceAdminRoute(workspaceId) + qParams(true, "userId" -> userId),
      patch,
      Option(token)
    ).decoded[User]

  def deleteUser(workspaceId: Int, userId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, userWorkspaceAdminRoute(workspaceId, userId), Option(token)).raw

  def putUserRoles(workspaceId: Int, userId: Int, roles: List[GlobalRole])(using
      token: String
  ): Result[List[GlobalRole]] =
    response(HttpMethods.PUT, userRolesWorkspaceAdminRoute(workspaceId, userId), roles, Option(token))
      .decoded[List[GlobalRole]]

  def getUserRoles(workspaceId: Int, userId: Int)(using token: String): Result[List[String]] =
    response(HttpMethods.GET, userRolesWorkspaceAdminRoute(workspaceId, userId), Option(token)).decoded[List[String]]
}
