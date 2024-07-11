package models

import db.Schema
import db.{Databases, Task}

import scala.concurrent.ExecutionContext.global
import scala.concurrent.{ExecutionContextExecutor, Future}

object Tasks extends Schema {
  import config.profile.api._

  given ec: ExecutionContextExecutor = global

  def find(db: Databases, workspaceId: Int, name: String): Future[Option[Task]] =
    db.engine.run(tasks.filter(t => t.workspaceId === workspaceId && t.name === name).result.headOption)

  def get(db: Databases, taskId: Int): Future[Option[Task]] =
    db.engine.run(tasks.filter(_.id === taskId).result.headOption)

  def getTasks(db: Databases, workspaceId: Int): Future[Seq[Task]] =
    db.engine.run(tasks.filter(_.workspaceId === workspaceId).result)

  def create(db: Databases, workspaceId: Int, name: String, key: String, index: Int): Future[Option[Task]] =
    db.engine.run(tasks.filter(t => t.workspaceId === workspaceId && t.name === name).result.headOption).flatMap {
      case Some(_) => Future(None)
      case _       =>
        val insertQuery = (tasks.map(t => (t.workspaceId, t.name, t.key, t.index)) returning tasks.map(_.id)) +=
          (workspaceId, name, key, index)
        db.engine.run(insertQuery).flatMap(id => db.engine.run(tasks.filter(_.id === id).result.headOption))
    }

  def update(
      db: Databases,
      workspaceId: Int,
      taskId: Int,
      name: String,
      key: String,
      index: Int
  ): Future[Option[Task]] =
    db.engine.run(
      tasks.filter(_.id === taskId).map(t => (t.name, t.key, t.index)).update(name, key, index)
    ) flatMap { _ =>
      get(db, taskId)
    }

  def delete(db: Databases, workspaceId: Int, taskId: Int): Future[Int] =
    db.engine.run(tasks.filter(t => t.id === taskId && t.workspaceId === workspaceId).delete)
}
