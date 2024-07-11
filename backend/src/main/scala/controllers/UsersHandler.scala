package controllers

import api.enumeration.GlobalRole
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.users.{PatchUser, PatchUserBySuperAdmin, PostUser, UserCreatedMessage}
import db._
import utils.pekkohttpcirce.FailFastCirceSupport._
import models.Users
import utils.MessagingBus
import utils.RestErrorFactory.Failure
import wsActor.ClientMessaging
import utils.RestErrorFactory._
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import io.circe.generic.auto._
import io.circe.syntax._
object UsersHandler {
  private given ec: ExecutionContextExecutor              = global
  given usersOrdering: Ordering[api.generated.users.User] = Ordering by { (u: api.generated.users.User) =>
    (u.firstName, u.id)
  }

  def createUser(
      db: Databases,
      workspaceId: Int,
      post: PostUser,
      isSuperAdmin: Boolean,
      maybeBus: Option[MessagingBus] = None
  ): Route =
    complete(Users.create(db, workspaceId, post, isSuperAdmin).map[ToResponseMarshallable] {
      case Right(user)    =>
        // Fixme to be added in Messaging task
        //        maybeBus.fold(()) { bus =>
        //          ClientMessaging.broadcastUserCreated(
        //            workspaceId,
        //            bus,
        //            UserCreatedMessage(
        //              user.userId,
        //              user.firstName,
        //              user.firstName,
        //              user.login,
        //              user.email,
        //              user.note,
        //              user.active
        //            )
        //          )
        //        }

        StatusCodes.Created -> user.toRest.asJson
      case Left(response) => response._1 -> Failure(response._2)
      // case _              => internalServerError
    })

  def readUsers(db: Databases, workspaceId: Int): Route = complete(
    Users.read(db, workspaceId).map[ToResponseMarshallable](_.map(_.toRest).sorted.asJson)
  )

  def updateUserBySuperAdmin(
      db: Databases,
      workspaceId: Int,
      userIdForPatch: Int,
      newUserData: PatchUserBySuperAdmin
  ): Route =
    complete(
      Users.patchBySuperAdmin(db, workspaceId, userIdForPatch, newUserData).map[ToResponseMarshallable] {
        case Right(user)      => StatusCodes.OK -> user.toRest
        case Left(statusCode) => statusCode._1  -> Failure(statusCode._2)
        // case _                => internalServerError
      }
    )

  def updateUser(
      db: Databases,
      workspaceId: Int,
      connectedUserId: Int,
      globalRoles: Set[GlobalRole],
      userIdForPatch: Option[Int],
      newUserData: PatchUser
  ): Route =
    complete(
      Users
        .patch(db, workspaceId, connectedUserId, globalRoles, userIdForPatch, newUserData)
        .map[ToResponseMarshallable] {
          case Right(user)    => StatusCodes.OK -> user.toRest
          case Left(response) => response._1    -> Failure(response._2)
          // case _              => internalServerError
        }
    )

  def readUserRoles(db: Databases, workspaceId: Int, userId: Int): Route = complete(
    Users.getUser(db, workspaceId, userId).map[ToResponseMarshallable] {
      case Some(user) => StatusCodes.OK       -> user.globalRoles.toList.asJson
      case None       => StatusCodes.NotFound -> Failure("Role Not found.")
    }
  )

  def setUserRoles(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      roles: List[GlobalRole],
      isSuperAdmin: Boolean
  ): Route = complete(
    Users.setGlobalRoles(db, workspaceId, userId, roles, isSuperAdmin).map[ToResponseMarshallable] {
      case Right(globalRole) => StatusCodes.OK -> globalRole
      case Left(response)    => response._1    -> Failure(response._2)
    }
  )

  def deleteUser(db: Databases, workspaceId: Int, userId: Int, connectedUserId: Int, isSuperAdmin: Boolean): Route =
    complete(
      Users
        .delete(db, workspaceId, userId, connectedUserId, isSuperAdmin)
        .map[ToResponseMarshallable](response => response._1 -> Failure(response._2))
    )
}
