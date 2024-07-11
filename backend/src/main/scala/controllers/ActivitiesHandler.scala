package controllers

import api.enumeration.GlobalRole
import api.enumeration._
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.projects.{PatchActivity, PostActivity}
import db._
import utils.pekkohttpcirce.FailFastCirceSupport._
import models.Activities
import utils.RestErrorFactory.{internalServerError, Failure}
import scala.concurrent.ExecutionContext.global
import scala.concurrent.{Await, ExecutionContextExecutor}
import scala.concurrent.duration.Duration
import io.circe.generic.auto._
import io.circe.syntax._
import utils.pekkohttpcirce._
object ActivitiesHandler {
  private given ec: ExecutionContextExecutor                          = global
  given activitiesOrdering: Ordering[api.generated.projects.Activity] = Ordering by {
    (a: api.generated.projects.Activity) =>
      (a.start, a.id)
  }

  def readActivityDetails(db: Databases, workspaceId: Int, activityId: Int, globalRoles: Set[GlobalRole])(
      action: Activity => Route
  ): Route =
    Await.result(
      Activities.getActivityById(db, workspaceId, activityId),
      Duration.Inf
    ) match {
      case Some(activity)                                      => action(activity)
      case _ if globalRoles.contains(GlobalRole.Administrator) =>
        complete(StatusCodes.NotFound -> Failure("Activity not found."))
      case _                                                   => complete(StatusCodes.Forbidden -> Failure("Forbidden or workspace not found."))
    }

  def readActivities(
      db: Databases,
      workspaceId: Int,
      userId: Option[Int],
      projectId: Option[Int],
      from: Option[java.time.LocalDate],
      to: Option[java.time.LocalDate]
  ): Route = complete(
    Activities.read(db, workspaceId, userId, projectId, from, to).map[ToResponseMarshallable] {
      case Right(activities) => StatusCodes.OK -> activities.map(ac => ac.toRest).sorted.reverse
      case Left(statusCode)  => statusCode._1  -> Failure(statusCode._2)
    }
  )

  def readUserProjectsActivities(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      mateId: Option[Int],
      from: Option[java.time.LocalDate],
      to: Option[java.time.LocalDate]
  ): Route = complete(
    Activities
      .getUserProjectsActivities(db, workspaceId, userId, mateId, from, to)
      .map[ToResponseMarshallable](_.map(_.toRest).sorted.reverse.asJson)
  )

  def createActivity(
      db: Databases,
      workspaceId: Int,
      globalRoles: Set[GlobalRole],
      newActivity: PostActivity
  ): Route = complete(
    Activities.create(db, workspaceId, globalRoles, newActivity).map[ToResponseMarshallable] {
      case Right(activity: Activity) => StatusCodes.Created -> activity.toRest
      case Left(statusCode)          => statusCode._1       -> Failure(statusCode._2)

    }
  )

  def patchActivity(
      db: Databases,
      workspaceId: Int,
      activityId: Int,
      newActivityData: PatchActivity,
      connectedUserGlobalRoles: Set[GlobalRole],
      connectedUserProjectRoles: Set[ProjectRole]
  ): Route = complete(
    Activities
      .patch(db, workspaceId, activityId, newActivityData, connectedUserGlobalRoles, connectedUserProjectRoles)
      .map[ToResponseMarshallable] {
        case Right(activity: Activity) => StatusCodes.OK -> activity.toRest
        case Left(statusCode)          => statusCode._1  -> Failure(statusCode._2)

      }
  )

  def deleteActivity(db: Databases, workspaceId: Int, activityId: Int): Route = complete(
    Activities
      .delete(db, workspaceId, activityId)
      .map[ToResponseMarshallable](response => response._1 -> Failure(response._2))
  )
}
