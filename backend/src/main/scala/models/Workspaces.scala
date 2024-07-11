package models

import db.{Databases, DbConfiguration, Schema, Workspace}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.NotFound

import scala.concurrent.Future

import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor

object Workspaces extends Schema {
  import config.profile.api._
  given ec: ExecutionContextExecutor = global

  def find(db: Databases, name: String): Future[Option[Workspace]] =
    db.engine.run(workspaces.filter(_.name === name).result.headOption)

  def get(db: Databases, workspaceId: Int): Future[Option[Workspace]] =
    db.engine.run(workspaces.filter(_.id === workspaceId).result.headOption)

  def create(db: Databases, name: String, description: String, active: Boolean): Future[Option[Workspace]] =
    db.engine.run(workspaces.filter(_.name === name).result.headOption).flatMap {
      case Some(_) => Future(None)
      case _       =>
        val insertQuery = (workspaces.map(ws => (ws.name, ws.description, ws.active)) returning workspaces.map(_.id)) +=
          (name, description, active)
        db.engine.run(insertQuery).flatMap(id => db.engine.run(workspaces.filter(_.id === id).result.headOption))
    }

  def update(
      db: Databases,
      workspaceId: Int,
      name: String,
      description: String,
      active: Boolean
  ): Future[Option[Workspace]] =
    db.engine.run(workspaces.filter(_.name === name).result.headOption).flatMap {
      case Some(ws) if ws.id != workspaceId => Future(None)
      case _                                =>
        db.engine
          .run(
            workspaces
              .filter(_.id === workspaceId)
              .map(w => (w.name, w.description, w.active))
              .update(name, description, active)
          )
          .flatMap(_ => get(db, workspaceId))
    }

  def read(db: Databases): Future[Seq[Workspace]] = db.engine.run(workspaces.result)

  def delete(db: Databases, workspaceId: Int): Future[StatusCode Either Int] =
    db.engine.run(workspaces.filter(_.id === workspaceId).result.headOption).flatMap {
      case Some(ws) =>
        // Fixme: to be improved
        db.engine.run(workspaces.filter(_.id === workspaceId).delete).flatMap { _ =>
          Future(Right(1))
        }
      case None     => Future(Left(NotFound))
    }
}
