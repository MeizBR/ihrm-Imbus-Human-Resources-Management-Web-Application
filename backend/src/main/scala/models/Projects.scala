package models

import api.enumeration.GlobalRole
import api.generated.projects.{PatchProject, PostProject}
import db.{Databases, Project, Schema}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.*
import utils.ClassLogging

import scala.concurrent.ExecutionContext.global
import scala.concurrent.{ExecutionContextExecutor, Future}

object Projects extends Schema with ClassLogging {

  import config.profile.api.*

  given ec: ExecutionContextExecutor = global

  def findProjectByName(db: Databases, workspaceId: Int, name: String): Future[Option[Project]] =
    db.engine.run(
      projects.filter(p => p.workspaceId === workspaceId && p.name === name && !p.isDeleted).result.headOption
    )

  def getProjectById(db: Databases, workspaceId: Int, projectId: Int): Future[Option[Project]] =
    db.engine.run(
      projects.filter(p => p.id === projectId && p.workspaceId === workspaceId && !p.isDeleted).result.headOption
    )

  def read(
      db: Databases,
      workspaceId: Int,
      maybeCustomerId: Option[Int],
      globalRoles: Set[GlobalRole]
  ): Future[Either[(StatusCode, String), Seq[Project]]] =
    maybeCustomerId.fold[Future[(StatusCode, String) Either Seq[Project]]](
      db.engine.run(projects.filter(p => p.workspaceId === workspaceId && !p.isDeleted).result).map {
        (projects: Seq[Project]) =>
          Right(projects)
      }
    ) { (customerId: Int) =>
      db.engine
        .run(customers.filter(c => c.workspaceId === workspaceId && c.id === customerId).result.headOption)
        .flatMap {
          case Some(_) =>
            db.engine
              .run(
                projects
                  .filter(p => p.workspaceId === workspaceId && p.customerId === customerId && !p.isDeleted)
                  .result
              )
              .map { (projects: Seq[Project]) =>
                Right(projects)
              }

          case None if globalRoles.contains(GlobalRole.Administrator) =>
            Future.successful(Left(NotFound, "Not found."))
          case _                                                      => Future.successful(Left(Forbidden, "Forbidden or workspace not found."))
        }
    }

  def create(
      db: Databases,
      workspaceId: Int,
      newProject: PostProject
  ): Future[Either[(StatusCode, String), Project]] =
    db.engine
      .run(customers.filter(c => c.workspaceId === workspaceId && c.id === newProject.customerId).result.headOption)
      .flatMap {
        case Some(_) =>
          db.engine
            .run(
              projects
                .filter(p =>
                  p.workspaceId === workspaceId && p.name === newProject.name && p.customerId === newProject.customerId && !p.isDeleted
                )
                .result
                .headOption
            )
            .flatMap {
              case Some(_) =>
                Future(Left(Conflict, "Unable to create a project, there is another project with the same name."))
              case _       =>
                insertProject(db, workspaceId, newProject)
            }
        case _       =>
          Future(Left(NotFound, "Not found."))
      }

  private def insertProject(
      db: Databases,
      workspaceId: Int,
      newProject: PostProject
  ): Future[Either[(StatusCode, String), Project]] = {
    val insertQuery = (projects.map(p =>
      (p.workspaceId, p.customerId, p.name, p.description, p.note, p.active, p.isDeleted)
    ) returning projects.map(_.id)) +=
      (workspaceId, newProject.customerId, newProject.name, newProject.description.getOrElse(""), newProject.note
        .getOrElse(""), newProject.isActive.getOrElse(false), false)
    db.engine.run(insertQuery).flatMap { case id: Int =>
      db.engine.run(projects.filter(_.id === id).result.headOption).map {
        case Some(project: Project) => Right(project)
        case None                   => Left(UnprocessableEntity, "\"Unable to insert the project.\"")
      }
    }
  }

  def patch(
      db: Databases,
      workspaceId: Int,
      projectId: Int,
      newProjectData: PatchProject
  ): Future[Either[(StatusCode, String), Project]] =
    db.engine
      .run(projects.filter(p => p.workspaceId === workspaceId && p.id === projectId && !p.isDeleted).result.headOption)
      .flatMap {
        case Some(oldProjectData: Project) =>
          newProjectData.customerId.fold(
            checkNameExistenceBeforeUpdate(db, workspaceId, projectId, newProjectData, oldProjectData)
          ) { (customerId: Int) =>
            db.engine
              .run(
                customers.filter(c => c.workspaceId === workspaceId && c.id === customerId).result.headOption
              )
              .flatMap {
                case Some(_) =>
                  checkNameExistenceBeforeUpdate(db, workspaceId, projectId, newProjectData, oldProjectData)
                case None    => Future(Left(NotFound, "Not found."))
              }
          }
        case None                          => Future(Left(NotFound, "Not found."))
      }

  private def checkNameExistenceBeforeUpdate(
      db: Databases,
      workspaceId: Int,
      projectId: Int,
      newProjectData: PatchProject,
      oldProjectData: Project
  ): Future[Either[(StatusCode, String), Project]] = db.engine
    .run(
      projects
        .filter(p =>
          p.workspaceId === workspaceId && p.name === newProjectData.name && p.id =!= projectId && !p.isDeleted
        )
        .result
        .headOption
    )
    .flatMap {
      case Some(_) =>
        Future(Left(Conflict, "Unable to update the project, there is another project with the same name."))
      case _       =>
        updateProject(db, workspaceId, projectId, newProjectData, oldProjectData)
    }

  private def updateProject(
      db: Databases,
      workspaceId: Int,
      projectId: Int,
      newProjectData: PatchProject,
      oldProjectData: Project
  ): Future[Either[(StatusCode, String), Project]] =
    db.engine
      .run(
        projects
          .filter(p => p.workspaceId === workspaceId && p.id === projectId)
          .map(p => (p.customerId, p.name, p.description, p.note, p.active, p.isDeleted))
          .update(
            newProjectData.customerId.getOrElse(oldProjectData.customerId),
            newProjectData.name.getOrElse(oldProjectData.name),
            newProjectData.description.getOrElse(oldProjectData.description),
            newProjectData.note.getOrElse(oldProjectData.note),
            newProjectData.isActive.getOrElse(oldProjectData.active),
            false
          )
      )
      .flatMap { _ =>
        getProjectById(db, workspaceId, projectId).map {
          case Some(project: Project) => Right(project)
          case _                      => Left(UnprocessableEntity, "Unable to update the project.")
        }
      }

  def delete(db: Databases, workspaceId: Int, projectId: Int): Future[(StatusCode, String)] =
    db.engine.run(projects.filter(p => p.workspaceId === workspaceId && p.id === projectId).result.headOption).flatMap {
      case Some(_) =>
        db.engine
          .run(projects.filter(p => p.workspaceId === workspaceId && p.id === projectId).map(_.isDeleted).update(true))
          .map(_ => NoContent -> "The project was successfully deleted.")
      case None    => Future(NotFound, "Not found.")
    }
}
