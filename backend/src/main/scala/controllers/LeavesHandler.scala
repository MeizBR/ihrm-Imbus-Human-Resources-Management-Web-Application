package controllers

import api.enumeration.GlobalRole
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.leaves.{PatchLeave, PostLeave, PutLeave}
import db.*
import utils.pekkohttpcirce.FailFastCirceSupport.*
import models.Leaves
import utils.RestErrorFactory.Failure
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import utils.RestErrorFactory.*
import utils.RestErrorFactory.*
import io.circe.generic.auto.*
import io.circe.syntax.*
object LeavesHandler {
  private given ec: ExecutionContextExecutor                         = global
  given leavesOrdering: Ordering[api.generated.leaves.Leave]         = Ordering by { (l: api.generated.leaves.Leave) =>
    (l.start, l.id)
  }
  given summaryOrdering: Ordering[api.generated.leaves.SummaryLeave] = Ordering by {
    (l: api.generated.leaves.SummaryLeave) =>
      (l.start, l.id)
  }

  def readLeave(db: Databases, workspaceId: Int, leaveId: Int): Route = complete(
    Leaves.get(db, workspaceId, leaveId).map[ToResponseMarshallable](_.map(_.toRest))
  )

  def readLeaves(db: Databases, workspaceId: Int, usersId: Option[Seq[Int]]): Route = complete(
    Leaves
      .getAll(db, workspaceId, usersId)
      .map[ToResponseMarshallable](
        _.map(_.toRest).sorted.reverse.asJson
      )
  )

  def readSummaryLeaves(
      db: Databases,
      workspaceId: Int,
      usersId: Option[Seq[Int]],
      state: Option[String],
      from: Option[java.time.LocalDate],
      to: Option[java.time.LocalDate]
  ): Route = complete(
    Leaves
      .getAllSummaryLeaves(db, workspaceId, usersId, state, from, to)
      .map[ToResponseMarshallable](_.map(_.toRest).sortBy(-_.id).asJson)
  )

  def createLeave(db: Databases, workspaceId: Int, userId: Int, newLeave: PostLeave): Route = complete(
    Leaves.create(db, workspaceId, userId, newLeave).map[ToResponseMarshallable] {
      case Right(leave)   => StatusCodes.Created -> leave.toRest
      case Left(response) => response._1         -> Failure(response._2)
      // case _              => internalServerError
    }
  )

  def patchLeave(db: Databases, workspaceId: Int, leaveId: Int, leave: PatchLeave): Route = complete(
    Leaves.patch(db, workspaceId, leaveId, leave).map[ToResponseMarshallable] {
      case Right(leave)     => StatusCodes.OK -> leave.toRest
      case Left(statusCode) => statusCode._1  -> Failure(statusCode._2)
      // case _                => internalServerError
    }
  )

  def putLeave(
      db: Databases,
      workspaceId: Int,
      connectedUserId: Int,
      leaveId: Int,
      leave: PutLeave,
      globalRoles: Set[GlobalRole]
  ): Route =
    complete(
      Leaves.put(db, workspaceId, connectedUserId, leaveId, leave, globalRoles).map[ToResponseMarshallable] {
        case Right(leave)     => StatusCodes.OK -> leave.toRest
        case Left(statusCode) => statusCode._1  -> Failure(statusCode._2)
      }
    )
}
