package controllers

import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.tasks.{PatchTask, PostTask}
import db._
import utils.pekkohttpcirce.FailFastCirceSupport._
import models.Tasks
import utils.RestErrorFactory.Failure
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import io.circe.generic.auto._
import io.circe.syntax._
import utils.pekkohttpcirce._
object TasksHandler {
  private given ec: ExecutionContextExecutor = global

  def createTask(db: Databases, workspaceId: Int, post: PostTask): Route = complete(
    Tasks.create(db, workspaceId, post.name, post.key, post.index).map[ToResponseMarshallable] {
      case Some(task) => StatusCodes.Created  -> task.toRest
      case _          => StatusCodes.Conflict -> Failure("Unable to create task.")
    }
  )

  def readTasks(db: Databases, workspaceId: Int): Route = complete(
    Tasks.getTasks(db, workspaceId).map[ToResponseMarshallable](_.map(_.toRest).asJson)
  )

  def updateTask(db: Databases, workspaceId: Int, taskId: Int, patch: PatchTask): Route = complete(
    Tasks.get(db, taskId).map[ToResponseMarshallable] {
      case None          => (StatusCodes.NotFound, Failure(s"Task with id $taskId in workspace $workspaceId not found."))
      case Some(current) =>
        Tasks
          .update(
            db,
            workspaceId,
            taskId,
            patch.name.getOrElse(current.name),
            patch.key.getOrElse(current.key),
            patch.index.getOrElse(current.index)
          )
          .map[ToResponseMarshallable] {
            case Some(task) => StatusCodes.OK       -> task.toRest
            case _          => StatusCodes.Conflict -> Failure("Unable to update task.")
          }
    }
  )

  def deleteTask(db: Databases, workspaceId: Int, taskId: Int): Route = complete(
    Tasks.delete(db, workspaceId, taskId).map[ToResponseMarshallable](_ => StatusCodes.NoContent)
  )
}
