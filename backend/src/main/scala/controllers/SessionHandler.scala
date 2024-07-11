package controllers
import scala.collection.concurrent.TrieMap
import api.enumeration.{GlobalRole, ProjectRole}
import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.model.headers.Authorization
import org.apache.pekko.http.scaladsl.server.Directives.{complete, provide}
import org.apache.pekko.http.scaladsl.server.directives.HeaderDirectives.optionalHeaderValueByName
import org.apache.pekko.http.scaladsl.server.{Directive1, Route}
import api.generated.sessions.{PostAdminSession, PostUserSession, UserSession => RestUserSession}
import db.{Databases, User}
import utils.pekkohttpcirce.FailFastCirceSupport._
import models.{Projects, SuperAdmins, Users}
import utils.RestErrorFactory.Failure
import utils._
import scala.concurrent.ExecutionContext.global
import scala.util.matching.Regex
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContextExecutor, Future}
import io.circe.generic.auto._
import utils.pekkohttpcirce._
object SessionHandler extends ClassLogging {
  private given ec: ExecutionContextExecutor = global

  private val timeout: Duration                   = 3.seconds
  private val bearerPattern: Regex                = """(?:[Bb]earer )?(\S*)""".r
  // private var adminSessions: String Map Int = Map.empty // todo: synchronize access
  // var userSessions: (Int, String) Map Int   = Map.empty // todo: synchronize access
  private var adminSessions: TrieMap[String, Int] = TrieMap.empty[String, Int]
  var userSessions: TrieMap[(Int, String), Int]   = TrieMap.empty[(Int, String), Int]
  def authenticateSuperAdmin: Directive1[Int]     =
    optionalHeaderValueByName(Authorization.name).flatMap {
      case Some(bearerPattern(token)) =>
        adminSessions.get(token) match {
          case Some(id) => provide(id)
          case None     => complete(StatusCodes.Unauthorized, Failure("Invalid authorization token"))
        }
      case _                          => complete(StatusCodes.Unauthorized, Failure("Missing authorization token"))
    }

  def loginSuperAdmin(db: Databases, cred: PostAdminSession): Route = complete(
    SuperAdmins.checkCredentials(db, cred.login, cred.password).map[ToResponseMarshallable] {
      case Some(admin) =>
        val token = Tokens.generate()
        adminSessions.update(token, admin.id) // Use update to add or modify the token -> id mapping
        (StatusCodes.Created, token)          // Explicitly return the token
      case _           => (StatusCodes.Unauthorized, Failure("Wrong login or password"))
    }
  )

  def logoutSuperAdmin(adminId: Int): Route = {
    adminSessions = adminSessions.filterNot(_._2 == adminId)
    complete(StatusCodes.NoContent)
  }

  def authenticateWorkspaceUser(
      db: Databases,
      workspaceId: Int,
      projectId: Option[Int] = None
  ): Directive1[(Int, Set[GlobalRole], Set[ProjectRole])] =
    optionalHeaderValueByName(Authorization.name).flatMap {
      case Some(bearerPattern(token)) =>
        userSessions.get((workspaceId, token)) match {
          case Some(userId) =>
            log.info(s"Authenticate Workspace User with id $userId")
            // TODO: replace blocking statement
            val projectNotFound = projectId.fold(false) { id =>
              Await.result(Projects.getProjectById(db, workspaceId, id), timeout).isEmpty
            }
            Await.result(Users.getRoles(db, workspaceId, userId, projectId), timeout) match {
              case Some((globalRoles, _)) if projectNotFound & globalRoles.isEmpty =>
                complete(StatusCodes.Forbidden, Failure("Forbidden or project not found."))
              case Some((_, _)) if projectNotFound                                 => complete(StatusCodes.NotFound, Failure("Project not found."))
              case Some((globalRoles, productRoles))                               => provide((userId, globalRoles, productRoles))
              case _                                                               =>
                complete(StatusCodes.Unauthorized, Failure("Could not check permissions."))
            }
          case _            =>
            log.debug(s"User with token $token can not be found.")
            complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
        }
      case _                          =>
        complete(StatusCodes.Unauthorized, Failure("Missing authorization token."))
    }

  def loginWorkspaceUser(db: Databases, cred: PostUserSession): Route = complete(
    Users.checkCredentials(db, cred.workspace, cred.login, cred.password).map[ToResponseMarshallable] {
      case Some(user: User) =>
        if (user.active) {
          val token = Tokens.generate()
          userSessions = userSessions.filterNot { case ((wId, token), uId) =>
            wId == user.workspaceId && uId == user.userId
          }
          userSessions += ((user.workspaceId, token) -> user.userId)
          log.info("User session successfully created.")
          (
            StatusCodes.Created,
            RestUserSession(
              user.workspaceId,
              user.userId,
              user.firstName + " " + user.lastName,
              token,
              user.globalRoles.map(_.toString).toList
            )
          )
        } else {
          log.info(s"Login failed. This user is inactive: ${user.userId}")
          (StatusCodes.Unauthorized, Failure("Login failed. This user is inactive."))
        }
      case None             =>
        log.debug(s"Cannot find a user with credentials $cred in the database.")
        // Here, you log the unauthorized access attempt and return the corresponding response.
        {
          log.info(s"Unauthorized access attempt for workspace: ${cred.workspace} with login: ${cred.login}")
          (StatusCodes.Unauthorized, "Wrong login or password.")
        }
    }
  )

  def logoutWorkspaceUser(workspaceId: Int, userId: Int): Route = {
    userSessions = userSessions.filterNot { case ((wsId, _), uId) => wsId == workspaceId && uId == userId }
    complete(StatusCodes.NoContent)
  }

  def getSession(db: Databases, workspaceId: Int, userId: Int): Route = {
    val userToken =
      userSessions.filter { case ((wId, _), id) => id == userId && wId == workspaceId }.keySet.lastOption.map(_._2)
    complete(
      userToken match {
        case Some(token) =>
          Users.getUser(db, workspaceId, userId).map[ToResponseMarshallable] {
            case Some(user: User) =>
              (
                StatusCodes.OK,
                RestUserSession(
                  workspaceId,
                  userId,
                  user.firstName + " " + user.lastName,
                  token,
                  user.globalRoles.map(_.toString).toList
                )
              )
            case _                => (StatusCodes.NotFound, Failure("Not found."))
          }
        case _           => Future(StatusCodes.NotFound, Failure("Not found."))
      }
    )
  }
}
