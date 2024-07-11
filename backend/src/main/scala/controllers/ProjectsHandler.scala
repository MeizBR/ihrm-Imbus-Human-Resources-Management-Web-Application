package controllers

import api.enumeration.{GlobalRole, ProjectRole}
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.projects.{PatchProject, PostProject, ProjectRoles}
import db.*
import utils.pekkohttpcirce.FailFastCirceSupport.*
import models.{ProjectUsers, Projects}
import utils.RestErrorFactory.{internalServerError, Failure}

import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import io.circe.generic.auto.*
import io.circe.syntax.*
import wsActor.NotificationManager.projectNotificationForUser

object ProjectsHandler {
  private given ec: ExecutionContextExecutor                       = global
  given projectsOrdering: Ordering[api.generated.projects.Project] = Ordering by {
    (p: api.generated.projects.Project) =>
      (p.name, p.id)
  }

  def readProjects(db: Databases, workspaceId: Int, maybeCustomerId: Option[Int], globalRoles: Set[GlobalRole]): Route =
    complete(
      Projects.read(db, workspaceId, maybeCustomerId, globalRoles).map[ToResponseMarshallable] {
        case Right(projects: Seq[Project]) => StatusCodes.OK -> projects.map(_.toRest).sorted
        case Left(response)                => response._1    -> Failure(response._2)
      }
    )

  def createProject(db: Databases, workspaceId: Int, post: PostProject): Route = complete(
    Projects
      .create(
        db,
        workspaceId,
        post: PostProject
      )
      .map[ToResponseMarshallable] {
        case Right(project: Project) => StatusCodes.Created -> project.toRest
        case Left(response)          => response._1         -> Failure(response._2)
      }
  )

  def updateProject(
      db: Databases,
      workspaceId: Int,
      projectId: Int,
      patch: PatchProject
  ): Route = complete(
    Projects.patch(db, workspaceId, projectId, patch).map[ToResponseMarshallable] {
      case Right(project: Project) => StatusCodes.OK -> project.toRest
      case Left(response)          => response._1    -> Failure(response._2)

    }
  )

  def deleteProject(
      db: Databases,
      workspaceId: Int,
      projectId: Int
  ): Route = complete(
    Projects
      .delete(db, workspaceId, projectId)
      .map[ToResponseMarshallable](response => response._1 -> Failure(response._2))
  )

  def updateProjectRoles(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      projectId: Int,
      roles: List[ProjectRole],
      globalRole: Set[GlobalRole]
  ): Route = complete(
    ProjectUsers
      .setProjectRoles(db, workspaceId, userId, projectId, roles.toSet, globalRole)
      .map[ToResponseMarshallable] {
        case Right(projectRoles) =>
          projectNotificationForUser(userId, projectId, workspaceId, db)
          StatusCodes.OK -> projectRoles
        case Left(response)      => response._1 -> Failure(response._2)

      }
  )

  def readProjectRoles(db: Databases, workspaceId: Int, userId: Int, projectId: Int): Route = complete(
    ProjectUsers.getProductRoles(db, workspaceId, userId, projectId)
  )

  def readProjectRolesOfAllUsers(db: Databases, workspaceId: Int, projectId: Int): Route = complete(
    ProjectUsers.getProductRoles(db, workspaceId, projectId).map {
      _.map { case (userId, roles) => ProjectRoles(userId = userId, roles = roles.toList) }
    }
  )

  def readUserProjects(db: Databases, workspaceId: Int, userId: Int): Route = complete(
    ProjectUsers.getUserProjects(db, workspaceId, userId).map[ToResponseMarshallable](_.map(_.toRest).sorted.asJson)
  )

}
