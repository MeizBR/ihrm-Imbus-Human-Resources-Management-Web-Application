package utils.Calls

import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.leaves._
import utils.HttpClient

trait LeaveCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String = "http://localhost:9000"

  private def leaveRoute(workspaceId: Int, leaveId: Int) =
    s"$route/api/workspaces/$workspaceId/leaves/$leaveId"

  private def leavesRoute(workspaceId: Int) =
    s"$route/api/workspaces/$workspaceId/leaves"

  private def userLeavesRoute(workspaceId: Int, userId: Int) =
    s"$route/api/workspaces/$workspaceId/leaves/$userId"

  def getLeave(workspaceId: Int, leaveId: Int)(using token: String): Result[Leave] =
    response(HttpMethods.GET, leaveRoute(workspaceId, leaveId), Option(token)).decoded[Leave]

  def getLeaves(
      workspaceId: Int,
      usersId: Option[Seq[Int]] = None,
      state: Option[String] = None,
      from: Option[java.time.LocalDate] = None,
      to: Option[java.time.LocalDate] = None
  )(using
      token: String
  ): Result[List[SummaryLeave]] =
    response(
      HttpMethods.GET,
      leavesRoute(workspaceId) + qParams(true, "usersId" -> usersId, "state" -> state, "from" -> from, "to" -> to),
      Option(token)
    ).decoded[List[SummaryLeave]]

  def postLeave(workspaceId: Int, userId: Option[Int] = None, leave: PostLeave)(using token: String): Result[Leave] =
    response(HttpMethods.POST, leavesRoute(workspaceId) + qParams(true, "userId" -> userId), leave, Option(token))
      .decoded[Leave]

  def patchLeave(workspaceId: Int, leaveId: Int, leave: PatchLeave)(using token: String): Result[Leave] =
    response(HttpMethods.PATCH, leaveRoute(workspaceId, leaveId), leave, Option(token)).decoded[Leave]

  def putLeave(workspaceId: Int, leaveId: Int, leave: PutLeave)(using token: String): Result[Leave] =
    response(HttpMethods.PUT, leaveRoute(workspaceId, leaveId), leave, Option(token)).decoded[Leave]
}
