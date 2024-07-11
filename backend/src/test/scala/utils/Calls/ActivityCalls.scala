package utils.Calls

import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.projects.{Activity, PatchActivity, PostActivity}
import utils.HttpClient

trait ActivityCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String = "http://localhost:9000"

  private def activitiesRoute(workspaceId: Int) = s"$route/api/workspaces/$workspaceId/activities"

  private def selfActivitiesRoute(workspaceId: Int) =
    s"$route/api/workspaces/$workspaceId/self/activities"

  private def activityRoute(workspaceId: Int, activityId: Int) = s"${activitiesRoute(workspaceId)}/$activityId"

  def postActivity(workspaceId: Int, activity: PostActivity)(using token: String): Result[Activity] =
    response(HttpMethods.POST, activitiesRoute(workspaceId), activity, Option(token)).decoded[Activity]

  def getActivities(
      workspaceId: Int,
      userId: Option[Int] = None,
      projectId: Option[Int] = None,
      from: Option[java.time.LocalDate] = None,
      to: Option[java.time.LocalDate] = None
  )(using
      token: String
  ): Result[List[Activity]] =
    response(
      HttpMethods.GET,
      activitiesRoute(workspaceId) + qParams(
        true,
        "userId"    -> userId,
        "projectId" -> projectId,
        "from"      -> from,
        "to"        -> to
      ),
      Option(token)
    ).decoded[List[Activity]]

  def getSelfActivities(
      workspaceId: Int,
      ProjectId: Option[Int] = None,
      from: Option[java.time.LocalDate] = None,
      to: Option[java.time.LocalDate] = None
  )(using
      token: String
  ): Result[List[Activity]] =
    response(
      HttpMethods.GET,
      selfActivitiesRoute(workspaceId) + qParams(
        true,
        "projectId" -> ProjectId,
        "from"      -> from,
        "to"        -> to
      ),
      Option(token)
    ).decoded[List[Activity]]

  def patchActivity(workspaceId: Int, activityId: Int, patch: PatchActivity)(using token: String): Result[Activity] =
    response(HttpMethods.PATCH, activityRoute(workspaceId, activityId), patch, Option(token)).decoded[Activity]

  def deleteActivity(workspaceId: Int, activityId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, activityRoute(workspaceId, activityId), Option(token)).raw
}
