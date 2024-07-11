package models

import api.enumeration.GlobalRole.{AccountManager, Administrator}
import api.enumeration.{GlobalRole, ProjectRole}
import api.generated.users.{PatchUser, PatchUserBySuperAdmin, PostUser}
import controllers.SessionHandler.userSessions
import db.{Databases, Schema, User}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.*
import utils.*

import scala.concurrent.ExecutionContext.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContextExecutor, Future}

object Users extends Schema with ClassLogging {

  import config.profile.api.*

  given ec: ExecutionContextExecutor = global

  type UserResult = (StatusCode, String) Either User

  def checkCredentials(db: Databases, workspace: String, login: String, password: String): Future[Option[User]] =
    db.engine.run((for {
      ws   <- workspaces.filter(_.name === workspace)
      user <- users.filter(u => u.workspaceId === ws.id && u.login === login && u.hashedPassword === password.hashed)
    } yield user).result.headOption)

  def getRoles(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      maybeProjectId: Option[Int]
  ): Future[Option[(Set[GlobalRole], Set[ProjectRole])]] =
    maybeProjectId.fold {
      getUser(db, workspaceId, userId).map(_.map(u => (u.globalRoles, Set.empty[ProjectRole])))
    } { projectId =>
      db.engine
        .run((for {
          (u, p) <-
            users.filter(_.id === userId).joinLeft(projectUsers.filter(_.projectId === projectId)).on(_.id === _.userId)
        } yield (u, p)).result.headOption)
        .map(_.map { case (u, p) =>
          (u.globalRoles, p.map(_.roles).getOrElse(Set()))
        })
        .recover { case e: Throwable =>
          log.error(s"\nFailed to read roles of user $userId:\n ${e.getMessage}")
          None
        }
    }

  def find(db: Databases, workspaceId: Int, login: String): Future[Option[User]] =
    db.engine.run(users.filter(u => u.workspaceId === workspaceId && u.login === login).result.headOption).recover {
      case e: Throwable =>
        log.error(s"\nCan not find user with login: $login \n ${e.getMessage}")
        None
    }

  def read(db: Databases, workspaceId: Int): Future[Seq[User]] =
    db.engine.run(users.filter(_.workspaceId === workspaceId).result)

  def getUser(db: Databases, workspaceId: Int, userId: Int): Future[Option[User]] =
    db.engine
      .run(users.filter(user => user.id === userId && user.workspaceId === workspaceId).result.headOption)
      .recover { case e: Throwable =>
        log.error(s"\nCan not find user with id: $userId \n ${e.getMessage}")
        None
      }

  def create(
      db: Databases,
      workspaceId: Int,
      newUser: PostUser,
      isSuperAdmin: Boolean
  ): Future[UserResult] =
    db.engine.run(workspaces.filter(_.id === workspaceId).result.headOption).flatMap {
      case Some(_) =>
        db.engine
          .run(
            users
              .filter(u => u.workspaceId === workspaceId && (u.login === newUser.login || u.email === newUser.email))
              .result
              .headOption
          )
          .flatMap {
            case Some(existingUser) =>
              if (existingUser.login == newUser.login)
                Future(Left(Conflict, "Login already exists."))
              else
                Future(Left(Conflict, "Email already exists."))
            case _                  =>
              // FIXME
              if (newUser.password.length < 6) Future(Left(UnprocessableEntity, "Invalid password format."))
              else if (!EmailValidator.isValid(newUser.email))
                Future(Left(UnprocessableEntity, "Invalid email format."))
              else insertUser(db, workspaceId, newUser)
          }
      case None    =>
        if (isSuperAdmin) Future(Left(NotFound, "Workspace not found."))
        else Future(Left(Forbidden, "Forbidden or workspace not found."))
      // case _ => Future(Left(InternalServerError, "\"Internal Server Error\", \"There was an internal server error.\""))
    }

  def insertUser(db: Databases, workspaceId: Int, newUser: PostUser): Future[UserResult] = {
    val insertQuery = (users.map(u =>
      (
        u.workspaceId,
        u.firstName,
        u.lastName,
        u.login,
        u.email,
        u.note,
        u.hashedPassword,
        u.admin,
        u.manager,
        u.active
      )
    ) returning users.map(_.id)) +=
      (workspaceId, newUser.firstName, newUser.lastName, newUser.login, newUser.email, newUser.note.getOrElse(
        ""
      ), newUser.password.hashed, false, false, newUser.isActive.getOrElse(false))
    db.engine.run(insertQuery).flatMap { case id: Int =>
      db.engine.run(users.filter(_.id === id).result.headOption).map {
        case None             => Left(NotFound, "Not found.")
        case Some(user: User) => Right(user)
      }
    }
  }

  def patchBySuperAdmin(
      db: Databases,
      workspaceId: Int,
      userIdForPatch: Int,
      newUserData: PatchUserBySuperAdmin
  ): Future[(StatusCode, String) Either User] =
    db.engine.run(workspaces.filter(_.id === workspaceId).result.headOption).flatMap {
      case Some(_) =>
        db.engine
          .run(users.filter(u => u.workspaceId === workspaceId && u.id === userIdForPatch).result.headOption)
          .flatMap {
            case Some(oldUserData: User) =>
              newUserData.password.fold(
                checkActiveOrInactiveUser(
                  db,
                  workspaceId,
                  userIdForPatch,
                  newUserData.firstName,
                  newUserData.lastName,
                  newUserData.login,
                  newUserData.email,
                  newUserData.note,
                  newUserData.isActive,
                  oldUserData,
                  oldUserData.hashedPassword
                )
              ) { newPassword =>
                if (newPassword.length >= 6)
                  checkActiveOrInactiveUser(
                    db,
                    workspaceId,
                    userIdForPatch,
                    newUserData.firstName,
                    newUserData.lastName,
                    newUserData.login,
                    newUserData.email,
                    newUserData.note,
                    newUserData.isActive,
                    oldUserData,
                    newPassword.hashed
                  )
                else Future(Left(Forbidden, "Invalid password format."))
              }
            case None                    => Future(Left(NotFound, "User not found."))
            // case _ =>
            // Future(Left(InternalServerError, "Internal Server Error\", \"There was an internal server error."))
          }

      case None => Future(Left(NotFound, "Workspace not found."))
      // case _    => Future(Left(InternalServerError, "\"Internal Server Error\", \"There was an internal server error.\""))
    }

  def patch(
      db: Databases,
      workspaceId: Int,
      connectedUserId: Int,
      globalRoles: Set[GlobalRole],
      userIdForPatch: Option[Int],
      newUserData: PatchUser
  ): Future[UserResult] =
    db.engine
      .run(
        users
          .filter(u => u.workspaceId === workspaceId && u.id === userIdForPatch.getOrElse(connectedUserId))
          .result
          .headOption
      )
      .flatMap {
        case Some(oldUserData: User) =>
          if (newUserData.isActive.fold(false)(isActive => !isActive && userIdForPatch.contains(connectedUserId)))
            Future(Left(Forbidden, "Forbidden or workspace not found."))
          else {
            val ConnectedUserHashedPsw =
              Await
                .result(
                  db.engine.run(
                    users.filter(u => u.workspaceId === workspaceId && u.id === connectedUserId).result.headOption
                  ),
                  Duration.Inf
                )
                .map(_.hashedPassword)
            if (globalRoles.contains(GlobalRole.Administrator))
              CheckPasswordBeforeUpdateUser(
                db,
                workspaceId,
                userIdForPatch.getOrElse(connectedUserId),
                newUserData,
                oldUserData,
                ConnectedUserHashedPsw
              )
            else Future(Left(Forbidden, "Forbidden or workspace not found."))
          }
        case None                    =>
          Future(Left(NotFound, "Not found."))
        // case _                       => Future(Left(InternalServerError, "Internal Server Error\", \"There was an internal server error."))
      }

  private def CheckPasswordBeforeUpdateUser(
      db: Databases,
      workspaceId: Int,
      userIdForPatch: Int,
      newUserData: PatchUser,
      oldUserData: User,
      ConnectedUserHashedPsw: Option[String]
  ): Future[UserResult] = {
    lazy val oldPsw = newUserData.password.map(_.passwordOfConnectedUser)
    lazy val newPsw = newUserData.password.map(_.newPassword)
    (oldPsw, newPsw) match {
      case (Some(passwordOfConnectedUser), Some(newPassword)) =>
        if (newPassword.length >= 6) {
          if (ConnectedUserHashedPsw.contains(passwordOfConnectedUser.hashed)) {
            val newHashedPassword = newPsw.fold(oldUserData.hashedPassword)(_.hashed)
            checkActiveOrInactiveUser(
              db,
              workspaceId,
              userIdForPatch,
              newUserData.firstName,
              newUserData.lastName,
              newUserData.login,
              newUserData.email,
              newUserData.note,
              newUserData.isActive,
              oldUserData,
              newHashedPassword
            )
          } else Future(Left(Forbidden, "Wrong password."))
        } else Future(Left(UnprocessableEntity, "Invalid password format."))
      case _                                                  =>
        checkActiveOrInactiveUser(
          db,
          workspaceId,
          userIdForPatch,
          newUserData.firstName,
          newUserData.lastName,
          newUserData.login,
          newUserData.email,
          newUserData.note,
          newUserData.isActive,
          oldUserData,
          oldUserData.hashedPassword
        )
    }
  }

  private def checkActiveOrInactiveUser(
      db: Databases,
      workspaceId: Int,
      userIdForPatch: Int,
      firstName: Option[String],
      lastName: Option[String],
      login: Option[String],
      email: Option[String],
      note: Option[String],
      isActive: Option[Boolean],
      oldUserData: User,
      password: String
  ): Future[UserResult] =
    if (isActive.isDefined && isActive.contains(false)) {
      userSessions = userSessions.filterNot { case ((wsId, _), uId) => wsId == workspaceId && uId == userIdForPatch }
      update(db, workspaceId, userIdForPatch, firstName, lastName, login, email, note, isActive, oldUserData, password)
    } else
      update(db, workspaceId, userIdForPatch, firstName, lastName, login, email, note, isActive, oldUserData, password)

  def update(
      db: Databases,
      workspaceId: Int,
      userIdForPatch: Int,
      firstName: Option[String],
      lastName: Option[String],
      login: Option[String],
      email: Option[String],
      note: Option[String],
      isActive: Option[Boolean],
      oldUserData: User,
      password: String
  ): Future[UserResult] = db.engine
    .run(
      users
        .filter(u =>
          u.workspaceId === workspaceId && u.id =!= userIdForPatch && (u.login === login || u.email === email)
        )
        .result
        .headOption
    )
    .flatMap {
      case Some(existingUser: User) if login.contains(existingUser.login)     =>
        Future.successful(Left(Conflict -> "Login already exists."))
      case Some(_: User)                                                      =>
        Future.successful(Left(Conflict -> "Email already exists."))
      case None if EmailValidator.isValid(email.getOrElse(oldUserData.email)) =>
        db.engine
          .run(
            users
              .filter(_.id === userIdForPatch)
              .map(u => (u.firstName, u.lastName, u.login, u.email, u.note, u.hashedPassword, u.active))
              .update(
                firstName.getOrElse(oldUserData.firstName),
                lastName.getOrElse(oldUserData.lastName),
                login.getOrElse(oldUserData.login),
                email.getOrElse(oldUserData.email),
                note.getOrElse(oldUserData.note),
                password,
                isActive.getOrElse(oldUserData.active)
              )
          )
          .flatMap { _ =>
            getUser(db, workspaceId, userIdForPatch).map {
              case Some(user) =>
                Right(user)
              case _          =>
                Left(Forbidden, "Forbidden or workspace not found.")
            }
          }

      case _ =>
        Future.successful(Left(UnprocessableEntity, "Invalid email format."))
    }

  def setGlobalRoles(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      roles: List[GlobalRole],
      isSuperAdmin: Boolean
  ): Future[(StatusCode, String) Either Set[GlobalRole]] =
    db.engine.run(workspaces.filter(_.id === workspaceId).result.headOption).flatMap {
      case Some(_) =>
        db.engine.run(users.filter(u => u.id === userId && u.workspaceId === workspaceId).result.headOption).flatMap {
          case Some(user) =>
            if (user.active)
              db.engine
                .run(
                  users
                    .filter(_.id === userId)
                    .map(c => (c.admin, c.manager))
                    .update(roles.contains(Administrator), roles.contains(AccountManager))
                )
                .flatMap(_ => getUser(db, workspaceId, userId).map(_.map(_.globalRoles)))
                .map {
                  case Some(roles: Set[GlobalRole]) => Right(roles)
                  case _                            => Left(Forbidden, "Forbidden or workspace not found.")
                }
            else Future(Left(Forbidden, "You cannot set global roles to an inactive user."))
          case None       =>
            if (isSuperAdmin) Future(Left(NotFound, "User not found."))
            else Future(Left(NotFound, "Not found."))
        }
      case None    =>
        if (isSuperAdmin) Future(Left(NotFound, "Workspace not found."))
        else Future(Left(Forbidden, "Forbidden or workspace not found."))
      // case _ => Future(Left(InternalServerError, "\"Internal Server Error\", \"There was an internal server error.\""))
    }

  def delete(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      connectedUserId: Int,
      isSuperAdmin: Boolean
  ): Future[(StatusCode, String)] =
    if (connectedUserId == userId) {
      Future(Forbidden -> "Forbidden or workspace not found.")
    } else {
      db.engine.run(workspaces.filter(_.id === workspaceId).result.headOption).flatMap {
        case Some(_) =>
          db.engine
            .run(users.filter(user => user.id === userId && user.workspaceId === workspaceId).result.headOption)
            .flatMap {
              case Some(_) =>
                db.engine
                  .run(users.filter(user => user.id === userId && user.workspaceId === workspaceId).delete)
                  .map(_ => NoContent -> "The user was successfully deleted.")
              case None    =>
                if (isSuperAdmin) Future(NotFound -> "User not found.")
                else Future(NotFound              -> "Not found.")
            }
        case None    =>
          if (isSuperAdmin)
            Future(NotFound  -> "Workspace not found.")
          else
            Future(Forbidden -> "Forbidden or workspace not found.")
        // case _ => Future(InternalServerError, "\"Internal Server Error\", \"There was an internal server error.\"")
      }
    }
  def getAdminsEmails(db: Databases, workspaceId: Int): Future[Seq[String]]              =
    db.engine.run(users.filter(user => user.workspaceId === workspaceId && user.admin === true).map(_.email).result)
  def getAdminsIds(db: Databases, workspaceId: Int): Future[Seq[Int]]                    =
    db.engine.run(users.filter(user => user.workspaceId === workspaceId && user.admin === true).map(_.id).result)
}
