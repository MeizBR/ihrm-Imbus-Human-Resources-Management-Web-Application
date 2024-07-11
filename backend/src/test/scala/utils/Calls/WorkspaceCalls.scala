package utils.Calls

import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.workspaces.{PatchWorkspace, PostWorkspace, Workspace}
import utils.HttpClient

trait WorkspaceCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String   = "http://localhost:9000"
  private val workspacesRoute = s"$route/api/admin/workspaces"

  private def workspaceRoute(workspaceId: Int) = s"$workspacesRoute/$workspaceId"

  def postWorkspace(ws: PostWorkspace)(using token: String): Result[Workspace] =
    response(HttpMethods.POST, workspacesRoute, ws, Option(token)).decoded[Workspace]

  def getWorkspaces()(using token: String): Result[List[Workspace]] =
    response(HttpMethods.GET, workspacesRoute, Option(token)).decoded[List[Workspace]]

  def patchWorkspace(workspaceId: Int, patch: PatchWorkspace)(using token: String): Result[Workspace] =
    response(HttpMethods.PATCH, workspaceRoute(workspaceId), patch, Option(token)).decoded[Workspace]

  def deleteWorkspace(workspaceId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, workspaceRoute(workspaceId), Option(token)).raw
}
