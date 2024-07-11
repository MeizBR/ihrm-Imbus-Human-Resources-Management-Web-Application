package utils.Calls

import api.enumeration.{GlobalRole, ProjectRole}
import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.projects.{PatchProject, PostProject, Project, ProjectRoles}
import utils.HttpClient

trait ProjectCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String = "http://localhost:9000"

  private def projectsRoute(workspaceId: Int) = s"$route/api/workspaces/$workspaceId/projects"

  private def projectRoute(workspaceId: Int, projectId: Int) = s"${projectsRoute(workspaceId)}/$projectId"

  private def ownProjectsRoute(workspaceId: Int, userId: Int) = s"${projectsRoute(workspaceId)}/projects/user/$userId"

  private def projectRolesRoute(workspaceId: Int, projectId: Int, userId: Int) =
    s"${projectRoute(workspaceId, projectId)}/users/$userId/roles"

  private def ownProjectRolesRoute(workspaceId: Int, projectId: Int) =
    s"${projectRoute(workspaceId, projectId)}/users/self/roles"

  private def projectRolesAllUsersRoute(workspaceId: Int, projectId: Int) =
    s"$route/api/workspaces/$workspaceId/projects/$projectId/users/roles"

  def postProject(workspaceId: Int, project: PostProject)(using token: String): Result[Project] =
    response(HttpMethods.POST, projectsRoute(workspaceId), project, Option(token)).decoded[Project]

  def getProjects(workspaceId: Int, customerId: Option[Int] = None)(using token: String): Result[List[Project]] =
    response(
      HttpMethods.GET,
      projectsRoute(workspaceId) + qParams(true, "customerId" -> customerId),
      Option(token)
    ).decoded[List[Project]]

  def patchProject(workspaceId: Int, projectId: Int, patch: PatchProject)(using token: String): Result[Project] =
    response(HttpMethods.PATCH, projectRoute(workspaceId, projectId), patch, Option(token)).decoded[Project]

  def deleteProject(workspaceId: Int, projectId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, projectRoute(workspaceId, projectId), Option(token)).raw

  def setProjectRoles(workspaceId: Int, projectId: Int, userId: Int, roles: List[ProjectRole])(using
      token: String
  ): Result[List[ProjectRole]] =
    response(HttpMethods.PUT, projectRolesRoute(workspaceId, projectId, userId), roles, Option(token))
      .decoded[List[ProjectRole]]

  def getProjectRoles(workspaceId: Int, projectId: Int, userId: Int)(using token: String): Result[List[String]] =
    response(HttpMethods.GET, projectRolesRoute(workspaceId, projectId, userId), Option(token)).decoded[List[String]]

  def getOwnProjectRoles(workspaceId: Int, projectId: Int)(using token: String): Result[List[String]] =
    response(HttpMethods.GET, ownProjectRolesRoute(workspaceId, projectId), Option(token)).decoded[List[String]]

  def getProjectRolesOfAllUsers(workspaceId: Int, projectId: Int)(using token: String): Result[List[ProjectRoles]] =
    response(HttpMethods.GET, projectRolesAllUsersRoute(workspaceId, projectId), Option(token))
      .decoded[List[ProjectRoles]]

  def getOwnProjects(workspaceId: Int, userId: Int)(using token: String): Result[List[Project]] =
    response(
      HttpMethods.GET,
      ownProjectsRoute(workspaceId, userId),
      Option(token)
    ).decoded[List[Project]]
}
