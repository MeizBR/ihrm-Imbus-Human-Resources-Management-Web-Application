package controllers

import org.apache.pekko.http.scaladsl.server.Route
import api.generated.workspaces.{PatchWorkspace, PostWorkspace}
import db._
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import utils.pekkohttpcirce.FailFastCirceSupport._

import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import org.apache.pekko.http.scaladsl.server.Directives.complete
import models.Workspaces
import utils.RestErrorFactory.Failure
import io.circe.generic.auto._

object WorkspacesHandler {
  private given ec: ExecutionContextExecutor                            = global
  given workspaceOrdering: Ordering[api.generated.workspaces.Workspace] = Ordering by {
    (c: api.generated.workspaces.Workspace) =>
      (c.name, c.id)
  }
  def createWorkspace(db: Databases, post: PostWorkspace): Route        = complete(
    Workspaces
      .create(db, post.name, post.description.getOrElse(""), post.isActive.getOrElse(true))
      .map[ToResponseMarshallable] {
        case Some(ws) => StatusCodes.Created  -> ws.toRest
        case _        => StatusCodes.Conflict -> Failure("Unable to create workspace.")
      }
  )

  def readWorkspaces(db: Databases): Route = complete(
    Workspaces.read(db).map[ToResponseMarshallable] {
      case workspaces if workspaces.nonEmpty =>
        StatusCodes.OK -> workspaces.map(_.toRest).sorted
      case _                                 =>
        StatusCodes.NotFound -> "Workspaces not found."
    }
  )

  def updateWorkspace(db: Databases, workspaceId: Int, patch: PatchWorkspace): Route = complete(
    Workspaces.get(db, workspaceId).map[ToResponseMarshallable] {
      case None          => (StatusCodes.NotFound, Failure(s"Workspace with id $workspaceId not found."))
      case Some(current) =>
        Workspaces
          .update(
            db,
            workspaceId,
            patch.name.getOrElse(current.name),
            patch.description.getOrElse(current.description),
            patch.isActive.getOrElse(current.active)
          )
          .map[ToResponseMarshallable] {
            case Some(ws) => StatusCodes.OK       -> ws.toRest
            case _        => StatusCodes.Conflict -> Failure("Unable to update workspace.")
          }
    }
  )

  def deleteWorkspace(db: Databases, workspaceId: Int): Route = complete(
    Workspaces.delete(db, workspaceId).map[ToResponseMarshallable] {
      case Left(statusCode) => statusCode -> "Workspace is not found"
      case _                => StatusCodes.NoContent
    }
  )
}
