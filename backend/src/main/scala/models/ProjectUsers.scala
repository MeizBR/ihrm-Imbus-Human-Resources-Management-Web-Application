package models

import api.enumeration.ProjectRole.{Lead, Member, Supervisor}
import api.enumeration.{GlobalRole, ProjectRole}
import db.*
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.InternalServerError
import utils.ClassLogging
import utils.RestErrorFactory.{
  deleteRoleLeadIsNotAllowed, inactiveUser, internalServerError, missingRolesOrWorkspaceNotFound, resourceNotFound,
  roleDeletionFailed
}
import wsActor.NotificationManager.projectNotificationForUser
import utils.RestErrorFactory.*

import scala.concurrent.ExecutionContext.global
import scala.concurrent.{ExecutionContextExecutor, Future}

object ProjectUsers extends Schema with ClassLogging {

  import config.profile.api.*

  given ec: ExecutionContextExecutor = global

  def getProductRoles(db: Databases, workspaceId: Int, userId: Int, projectId: Int): Future[Set[ProjectRole]] =
    db.engine
      .run(
        projectUsers
          .filter(p => p.workspaceId === workspaceId && p.userId === userId && p.projectId === projectId)
          .result
          .headOption
      )
      .map {
        case Some(pu) => pu.roles
        case _        => Set()
      }

  def getProductRoles(db: Databases, workspaceId: Int, projectId: Int): Future[Seq[(Int, Set[ProjectRole])]] =
    db.engine.run(projectUsers.filter(p => p.workspaceId === workspaceId && p.projectId === projectId).result).map {
      users =>
        users.map(pu => pu.userId -> pu.roles)
    }

  def setProjectRoles(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      projectId: Int,
      newProjectRoles: Set[ProjectRole],
      connectedUserGlobalRole: Set[GlobalRole]
  ): Future[(StatusCode, String) Either Set[ProjectRole]] = {
    lazy val isWorkspaceAdmin: Boolean = connectedUserGlobalRole.contains(GlobalRole.Administrator)
    db.engine
      .run(users.filter(user => user.workspaceId === workspaceId && user.id === userId).result.headOption)
      .flatMap {
        case Some(user: User) =>
          if (user.active) {
            getProductRoles(db, workspaceId, userId, projectId).flatMap { case existingProjectRoles: Set[ProjectRole] =>
              if (existingProjectRoles.isEmpty) {
                db.engine
                  .run(
                    projectUsers
                      .map(pu => (pu.workspaceId, pu.projectId, pu.userId, pu.lead, pu.supervisor, pu.member)) +=
                      (workspaceId, projectId, userId, newProjectRoles.contains(Lead), newProjectRoles
                        .contains(Supervisor), newProjectRoles.contains(Member))
                  )
                  .flatMap(_ =>
                    getProductRoles(db, workspaceId, userId, projectId).flatMap { case roles: Set[ProjectRole] =>
                      Future(Right(roles))

                    }
                  )

              } else if (
                !isWorkspaceAdmin && (existingProjectRoles.contains(
                  Lead
                ) && (newProjectRoles.isEmpty || !newProjectRoles.contains(Lead)))
              )
                Future.successful(Left(deleteRoleLeadIsNotAllowed()))
              else if (
                isWorkspaceAdmin && newProjectRoles.isEmpty || (!isWorkspaceAdmin && !existingProjectRoles.contains(
                  Lead
                ) && newProjectRoles.isEmpty)
              ) {
                db.engine.run(projectUsers.filter(pu => pu.projectId === projectId && pu.userId === userId).delete)
                getProductRoles(db, workspaceId, userId, projectId).flatMap { case roles: Set[ProjectRole] =>
                  Future(Right(roles))

                }
              } else {
                db.engine
                  .run(
                    projectUsers
                      .filter(p => p.userId === userId && p.projectId === projectId)
                      .map(p => (p.lead, p.supervisor, p.member))
                      .update(
                        newProjectRoles.contains(Lead),
                        newProjectRoles.contains(Supervisor),
                        newProjectRoles.contains(Member)
                      )
                  )
                  .flatMap(_ =>
                    getProductRoles(db, workspaceId, userId, projectId).flatMap { case roles: Set[ProjectRole] =>
                      Future(Right(roles))

                    }
                  )

              }
            }
          } else Future(Left(inactiveUser))
        case None             =>
          if (isWorkspaceAdmin) Future(Left(resourceNotFound))
          else Future(Left(missingRolesOrWorkspaceNotFound))
      }
  }

  def getUserProjects(db: Databases, workspaceId: Int, userId: Int): Future[Seq[Project]] = {
    val query = for {
      pu      <- projectUsers.filter(pu => pu.workspaceId === workspaceId && pu.userId === userId)
      project <- projects.filter(p => p.id === pu.projectId && !p.isDeleted)
    } yield project
    db.engine.run(query.result)
  }
}
