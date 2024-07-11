package ihrm

import api.enumeration.{GlobalRole, ProjectRole}

import java.lang.System.currentTimeMillis as now
import java.util.concurrent.CountDownLatch
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.event.LoggingAdapter
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model.HttpMethods.*
import org.apache.pekko.http.scaladsl.model.{HttpRequest, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives.{patch, post, *}
import org.apache.pekko.http.scaladsl.server.RouteResult.{Complete, Rejected}
import org.apache.pekko.http.scaladsl.server.directives.{DebuggingDirectives, LoggingMagnet}
import org.apache.pekko.http.scaladsl.server.{Route, RouteResult}
import api.enumeration.ProjectRole.{Lead, Member, Supervisor}
import api.generated.calendars.{PatchCalendar, PostCalendar}
import api.generated.cards.{PatchCard, PostCard}
import api.generated.customers.{PatchCustomer, PostCustomer}
import api.generated.events.{PatchEvent, PostEvent}
import api.generated.leaves.{PatchLeave, PostLeave, PutLeave}
import api.generated.projects.{PatchActivity, PatchProject, PostActivity, PostProject}
import api.generated.sessions.{PostAdminSession, PostUserSession}
import api.generated.tasks.{PatchTask, PostTask}
import api.generated.users.{PatchUser, PatchUserBySuperAdmin, PostUser}
import api.generated.workspaces.{PatchWorkspace, PostWorkspace}
import org.apache.pekko.http.cors.scaladsl.CorsDirectives.cors
import org.apache.pekko.http.cors.scaladsl.settings.CorsSettings
import com.typesafe.config.{Config, ConfigFactory}
import controllers.ActivitiesHandler.readActivityDetails
import controllers.CalendarsHandler.*
import controllers.{
  ActivitiesHandler, CardsHandler, CustomersHandler, EventsHandler, LeavesHandler, NotificationHandler, ProjectsHandler,
  SessionHandler, TasksHandler, UsersHandler, WorkspacesHandler
}
import db.{Calendar, Databases}
import utils.pekkohttpcirce.FailFastCirceSupport.*
import models.Events.checkEventExists
import models.{Activities, Calendars, Events, Leaves, ProjectUsers}
import org.apache.pekko.http.scaladsl.model.ws.Message
import org.slf4j.LoggerFactory
import utils.RestErrorFactory.Failure
import utils.{MessagingBus, *}
import wsActor.WsFlow

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.ExecutionContext.global as ec
import scala.concurrent.duration.{Duration, DurationInt}
import scala.concurrent.{Await, Future}
object Server extends App with ClassLogging {

  given system: ActorSystem = ActorSystem("ihrm")
  val conf                  = ConfigFactory.load()
  var devMode               = true
  lazy val db               = Databases(devMode)

  lazy val asyncIODispatcher = "async-io-dispatcher"

  lazy val bus = new MessagingBus()

  println(s"testttttttttttt$bus")
  lazy val http                   = new HttpClientForMsg()
  println(s"testttttttttttt$http")
  private def sync[T](f: => T): T = synchronized(f)

  var isRunningLatch: CountDownLatch  = new CountDownLatch(1)
  var isFinishedLatch: CountDownLatch = new CountDownLatch(1)

  //  // used only in tests to reset the static count down latches
  def resetCountDownLatches(): Unit = {
    log.info(".... start to reset CountDownLatches ...\n")
    isRunningLatch = new CountDownLatch(1)
    isFinishedLatch = new CountDownLatch(1)
  }

  def isRunning: CountDownLatch = isRunningLatch

  def isFinished: CountDownLatch = isFinishedLatch

  if (devMode) {
    log.info("Start check db version.................")
    db.checkDbVersion match {
      case Some(terminated) =>
        db.close()
        terminated.onComplete { _ =>
          log.error("Actor system stopped.")
        }(ec)
      case None             =>
        try withConnections(conf, db)
        catch {
          case e: Throwable => log.error(e.getMessage)
        } finally {
          db.close()
          system
            .terminate()
            .onComplete { r =>
              log.info(s"Actor system stopped: $r")
            }(ec)
        }
    }
  }

  def withConnections(conf: Config, db: Databases)(using system: ActorSystem): Unit = {

    val timeLog = LoggerFactory.getLogger(getClass.getPackageName + ".Time")

    log.info("Starting ihrm backend.")
    try {
      log.debug("Actor system started.")

      val logResponseTime = {
        def doLogging(start: Long)(q: HttpRequest): RouteResult => Unit = {
          case Complete(r) => timeLog.info(s"REQTIM: ${now - start}ms ${q.method.value} ${q.uri.path} -> ${r.status}")
          case Rejected(_) => log.info(s"REJECT: ${q.method.value} ${q.uri.path}")
        }

        DebuggingDirectives.logRequestResult(LoggingMagnet { (_: LoggingAdapter) =>
          doLogging(now)
        })
      }

      val routes: Route      = requestContext =>
        logResponseTime(
          pathPrefix("doc" / "api") {
            getFromBrowseableDirectory("../api/")
          } ~ apiRoutes(db)
        )(requestContext)
      val interface          = conf.getString("http.host")
      val port               = conf.getInt("http.port")
      val corsAllowedMethods = collection.immutable.Seq(GET, POST, PATCH, PUT, DELETE)
      val corsSettings       = CorsSettings.default.withAllowedMethods(corsAllowedMethods)
      val routeWithCors      = cors(corsSettings)(routes)
      val bindingFuture      = Http().newServerAt(interface, port).bind(routeWithCors)

      log.info(s"SVINIT: ihrm backend started on http://$interface:$port.")
      Thread.sleep(200) // Allow logging to flush to console
      println("Press RETURN to stop service.\n")
      isRunning.countDown()
      val reason = waitForTermination(isFinished)
      log.info(s"SVSTOP: Stopping ihrm backend after $reason.")
      Await.result(bindingFuture.flatMap(_.unbind())(ec), 10.seconds)
    } catch {
      case e: Throwable =>
        log.error(s".................. ${e.getMessage}")
        sys.exit(1)
    } finally system.terminate().onComplete(_ => log.info("Actor system stopped."))(ec)
  }

  private def ensureSuperAdmin(action: Int => Route): Route = SessionHandler.authenticateSuperAdmin(action)

  private def ensureWorkspaceUser(workspaceId: Int)(action: (Int, Set[GlobalRole]) => Route): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId) { case (id, globalRoles, _) => action(id, globalRoles) }

  private def ensureWorkspaceAdmin(workspaceId: Int)(action: Int => Route): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId) {
      case (id, roles, _) if roles.contains(GlobalRole.Administrator) => action(id)
      case _                                                          => complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
    }

  private def ensureWorkspaceAdminOrWorkspaceUser(
      workspaceId: Int
  )(adminAction: Int => Route)(projectRoleAction: Int => Route): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId) {
      case (id, globalRoles, _) if globalRoles.contains(GlobalRole.Administrator) => adminAction(id)
      case (id, _, _)                                                             => projectRoleAction(id)
      // case _                                                                      => complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
    }

  private def ensureWorkspaceAdminOrHasProjectRole(workspaceId: Int, projectId: Int, roles: ProjectRole*)(
      action: (Int, Set[GlobalRole]) => Route
  ): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId, Some(projectId)) {
      case (connectedUserId, globalsRoles, projectRoles) =>
        if (globalsRoles.contains(GlobalRole.Administrator) || projectRoles.intersect(roles.toSet).nonEmpty) {
          action(connectedUserId, globalsRoles)
        } else
          complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
    }

  def ensurePostActivityPermissions(workspaceId: Int, connectedUserId: Int, newActivity: PostActivity)(
      action: Int => Route
  ): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId, Some(newActivity.projectId)) {
      case (userId, globalsRoles, projectRoles) =>
        val isAdmin         = globalsRoles.contains(GlobalRole.Administrator)
        val hasProjectRoles = projectRoles.intersect(projectRoles).nonEmpty
        val isProjectLead   = projectRoles.contains(ProjectRole.Lead)
        if (isAdmin || hasProjectRoles)
          if (connectedUserId == newActivity.userId) action(userId)
          else if (isProjectLead || isAdmin) action(userId)
          else complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
        else complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
    }

  def verifyActivityOwner(db: Databases, workspaceId: Int, activityId: Int, userId: Int): Boolean = {
    val futureIsOwner =
      Activities.getActivityById(db, workspaceId, activityId).map(activity => activity.map(_.userId == userId))
    val maybeIsOwner  = Await.result(futureIsOwner, Duration.Inf)
    maybeIsOwner.contains(true)
  }

  def verifyLeaveOwner(db: Databases, workspaceId: Int, leaveId: Int, userId: Int): Boolean =
    Await.result(Leaves.get(db, workspaceId, leaveId).map(leave => leave.map(_.userId).contains(userId)), Duration.Inf)

  def verifyEventOwner(db: Databases, workspaceId: Int, eventId: Int, userId: Int): Boolean =
    Await.result(Events.get(db, workspaceId, eventId).map(_.map(_.creator).contains(userId)), Duration.Inf)

  private def checkPatchDeleteActivityPermissions(
      workspaceId: Int,
      activityId: Int,
      projectId: Option[Int]
  )(action: (Int, Set[GlobalRole], Set[ProjectRole]) => Route): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId, projectId) { case (userId, globalsRoles, projectRoles) =>
      if (
        globalsRoles.contains(GlobalRole.Administrator) || projectRoles.contains(
          ProjectRole.Lead
        ) || verifyActivityOwner(db, workspaceId, activityId, userId)
      )
        action(userId, globalsRoles, projectRoles)
      else
        complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
    }

  private def ensureHasPatchDeleteActivityPermissions(
      workspaceId: Int,
      activityId: Int,
      projectId: Option[Int]
  )(action: (Int, Set[GlobalRole], Set[ProjectRole]) => Route): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId, projectId) { case (_, globalRoles, _) =>
      projectId.fold(
        readActivityDetails(db, workspaceId, activityId, globalRoles) { oldActivity =>
          checkPatchDeleteActivityPermissions(workspaceId, activityId, Some(oldActivity.projectId))(action)
        }
      ) { projectIdForPatch =>
        checkPatchDeleteActivityPermissions(workspaceId, activityId, Some(projectIdForPatch))(action)
      }
    }

  private def ensureWorkspaceAdminOrLeaveOwner(workspaceId: Int, leaveId: Int)(
      action: (Int, Set[GlobalRole]) => Route
  ): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId, None) { case (userId, globalsRoles, _) =>
      if (globalsRoles.contains(GlobalRole.Administrator) || verifyLeaveOwner(db, workspaceId, leaveId, userId))
        action(userId, globalsRoles)
      else
        complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
    }

  private def readCalendarAndCheckPermission(
      workspaceId: Int,
      calendarId: Int,
      globalRoles: Set[GlobalRole],
      userId: Int
  )(action: (Int, Set[GlobalRole], Boolean) => Route): Route =
    readCalendarDetails(db, workspaceId, calendarId, globalRoles) { calendar =>
      if (
        (globalRoles.contains(GlobalRole.Administrator) && isAPublicCalendar(calendar))
        || calendarOwner(calendar, userId) || (isGlobalCalendar(
          calendar
        ) && isAPublicCalendar(calendar)) || (isAPublicCalendar(calendar) && calendarConnectedUserHasRole(
          db,
          workspaceId,
          calendarId,
          userId
        ))
      )
        action(userId, globalRoles, calendar.isPrivate)
      else complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
    }

  private def ensureWorkspaceAdminOrHasEventAccess(workspaceId: Int, calendarId: Int)(
      action: (Int, Set[GlobalRole], Boolean) => Route
  ): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId, None) { case (userId, globalRoles, _) =>
      readCalendarAndCheckPermission(workspaceId, calendarId, globalRoles, userId)(action)
    }

  private def EventPermissionCheck(workspaceId: Int, eventId: Int)(
      action: (Int, Set[GlobalRole], Boolean) => Route
  ): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId, None) { case (userId, globalRoles, _) =>
      Await
        .result(checkEventExists(db, workspaceId, eventId), Duration.Inf)
        .fold[Route](
          if (globalRoles.contains(GlobalRole.Administrator))
            complete(StatusCodes.NotFound, Failure("Event not found."))
          else complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
        ) { calendarId =>
          readCalendarAndCheckPermission(workspaceId, calendarId, globalRoles, userId)(action)
        }
    }

  private def ensureCalendarOwner(workspaceId: Int, calendarId: Int)(action: Int => Route): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId) { case (userId, globalsRoles, _) =>
      readCalendarDetails(db, workspaceId, calendarId, globalsRoles) { calendar =>
        if (
          calendarOwner(calendar, userId) && (!isAPublicCalendar(
            calendar
          ))
        ) action(userId)
        else complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
      }
    }

  private def ensureWorkspaceAdminOrCalendarOwner(
      workspaceId: Int,
      calendarId: Int,
      projectId: Option[Int],
      isPrivateCalendar: Option[Boolean]
  )(action: (Set[GlobalRole], Calendar, Int) => Route): Route =
    SessionHandler.authenticateWorkspaceUser(db, workspaceId, None) { case (userId, globalsRoles, _) =>
      readCalendarDetails(db, workspaceId, calendarId, globalsRoles) { calendar =>
        projectId match {
          case Some(_) =>
            if (
              globalsRoles.contains(GlobalRole.Administrator) && (calendarOwner(
                calendar,
                userId
              ) || (isAPublicCalendar(
                calendar
              ) && calendarUserHasProjectsRole(db, workspaceId, calendar, projectId) && adminPatchCondition(
                isPrivateCalendar
              )))
            )
              action(globalsRoles, calendar, userId)
            else if (
              calendarOwner(
                calendar,
                userId
              ) && calendarUserHasProjectsRole(db, workspaceId, calendar, projectId)
            )
              action(globalsRoles, calendar, userId)
            else complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
          case _       =>
            if (
              (globalsRoles.contains(GlobalRole.Administrator) && isAPublicCalendar(
                calendar
              ) && adminPatchCondition(isPrivateCalendar)) || calendarOwner(
                calendar,
                userId
              )
            )
              action(globalsRoles, calendar, userId)
            else
              complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
        }
      }
    }

  def calendarConnectedUserHasRole(db: Databases, workspaceId: Int, calendarId: Int, connectedUserId: Int): Boolean =
    Await
      .result(Calendars.calendarConnectedUserHasProjectRole(db, workspaceId, calendarId, connectedUserId), Duration.Inf)

  def calendarUserHasProjectsRole(
      db: Databases,
      workspaceId: Int,
      calendar: Calendar,
      projectId: Option[Int]
  ): Boolean =
    Await.result(Calendars.calendarUserHasProjectRole(db, workspaceId, calendar, projectId), Duration.Inf)

  def getUserProjects(
      db: Databases,
      workspaceId: Int,
      userId: Int
  ): Future[Seq[Int]] = {
    val userProjectsFuture = ProjectUsers.getUserProjects(db, workspaceId, userId)
    for {
      userProjects <- userProjectsFuture
    } yield userProjects.map(_.projectId)
  }

  def apiRoutes(db: Databases): Route = sync[Route] {
    notificationsRoutes(db) ~
    sessionRoutes(db) ~
    workspacesRoutes(db) ~
    usersRoutes(db) ~
    customersRoutes(db) ~
    projectsRoutes(db) ~
    activitiesRoutes(db) ~
    calendarsRoutes(db) ~
    leavesRoutes(db) ~
    tasksRoutes(db) ~
    cardsRoutes(db) ~
    eventsRoutes(db) ~
    messagingRoute()
  }

  private def messagingRoute(): Route =
    path("api" / "workspaces" / IntNumber / "messaging" / Segment) { (workspaceId, token) =>
      println("yes")
      println(workspaceId)
      println(token)

      handleWebSocketMessages(WsFlow.Apply(workspaceId, token, bus, http, db))
    }

  private def sessionRoutes(db: Databases): Route =
    pathPrefix("api" / "admin" / "session") {
      pathEnd {
        post {
          entity(as[PostAdminSession])(SessionHandler.loginSuperAdmin(db, _))
        } ~
        delete {
          ensureSuperAdmin(SessionHandler.logoutSuperAdmin)
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / "session") {
        pathEnd {
          post {
            entity(as[PostUserSession])(SessionHandler.loginWorkspaceUser(db, _))
          }
        }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "session") { workspaceId =>
        pathEnd {
          delete {
            ensureWorkspaceUser(workspaceId)((userId, _) => SessionHandler.logoutWorkspaceUser(workspaceId, userId))
          } ~ get {
            ensureWorkspaceUser(workspaceId)((userId, _) => SessionHandler.getSession(db, workspaceId, userId))
          }
        }
      }

  private def workspacesRoutes(db: Databases): Route =
    pathPrefix("api" / "admin" / "workspaces") {
      pathEnd {
        post {
          entity(as[PostWorkspace]) { post =>
            ensureSuperAdmin(_ => WorkspacesHandler.createWorkspace(db, post))
          }
        } ~
        get {
          ensureSuperAdmin(_ => WorkspacesHandler.readWorkspaces(db))
        }
      }
    } ~
      pathPrefix("api" / "admin" / "workspaces" / IntNumber) { workspaceId =>
        pathEnd {
          patch {
            entity(as[PatchWorkspace]) { patch =>
              ensureSuperAdmin(_ => WorkspacesHandler.updateWorkspace(db, workspaceId, patch))
            }
          } ~
          delete {
            ensureSuperAdmin(_ => WorkspacesHandler.deleteWorkspace(db, workspaceId))
          }
        }
      }

  private def usersRoutes(db: Databases): Route =
    pathPrefix("api" / "admin" / "workspaces" / IntNumber / "users") { workspaceId =>
      pathEnd {
        post {
          entity(as[PostUser]) { post =>
            ensureSuperAdmin(_ => UsersHandler.createUser(db, workspaceId, post, isSuperAdmin = true))
          }
        } ~
        get {
          ensureSuperAdmin(_ => UsersHandler.readUsers(db, workspaceId))
        }
      }
    } ~
      pathPrefix("api" / "admin" / "workspaces" / IntNumber / "users" / IntNumber) { (workspaceId, userIdForPatch) =>
        pathEnd {
          patch {
            entity(as[PatchUserBySuperAdmin]) { newUserData =>
              ensureSuperAdmin(_ => UsersHandler.updateUserBySuperAdmin(db, workspaceId, userIdForPatch, newUserData))
            }
          } ~
          delete {
            ensureSuperAdmin((connectedUserId: Int) =>
              UsersHandler.deleteUser(db, workspaceId, userIdForPatch, connectedUserId, isSuperAdmin = true)
            )
          }
        }
      } ~
      pathPrefix("api" / "admin" / "workspaces" / IntNumber / "users" / IntNumber / "roles") { (workspaceId, userId) =>
        pathEnd {
          put {
            entity(as[List[GlobalRole]]) { roles =>
              ensureSuperAdmin(_ => UsersHandler.setUserRoles(db, workspaceId, userId, roles, isSuperAdmin = true))
            }
          } ~
          get {
            ensureSuperAdmin(_ => UsersHandler.readUserRoles(db, workspaceId, userId))
          }
        }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "users") { workspaceId =>
        pathEnd {
          post {
            entity(as[PostUser]) { post =>
              ensureWorkspaceAdmin(workspaceId)(_ =>
                UsersHandler.createUser(db, workspaceId, post, isSuperAdmin = false)
              )
            }
          } ~
          get {
            ensureWorkspaceUser(workspaceId)((_, _) => UsersHandler.readUsers(db, workspaceId))
          } ~ patch {
            parameter("userId".as[Int].?) { (maybeUserIdForPatch: Option[Int]) =>
              entity(as[PatchUser]) { newUserData =>
                ensureWorkspaceUser(workspaceId)((connectedUserId, globalRoles) =>
                  UsersHandler
                    .updateUser(db, workspaceId, connectedUserId, globalRoles, maybeUserIdForPatch, newUserData)
                )
              }
            }
          }
        }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "users" / IntNumber) { (workspaceId, userId) =>
        pathEnd {
          delete {
            ensureWorkspaceAdmin(workspaceId)((connectedUserId: Int) =>
              UsersHandler.deleteUser(db, workspaceId, userId, connectedUserId, isSuperAdmin = false)
            )
          }
        }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "users" / IntNumber / "roles") { (workspaceId, userId) =>
        pathEnd {
          put {
            entity(as[List[GlobalRole]]) { roles =>
              ensureWorkspaceAdmin(workspaceId)(_ =>
                UsersHandler.setUserRoles(db, workspaceId, userId, roles, isSuperAdmin = false)
              )
            }
          } ~
          get {
            ensureWorkspaceUser(workspaceId)((_, _) => UsersHandler.readUserRoles(db, workspaceId, userId))
          }
        }
      } /*~
      pathPrefix("api" / "workspaces" / IntNumber / "users" / "self") { workspaceId =>
        pathEnd {
          patch {
            entity(as[PatchUser]) { patch =>
              ensureWorkspaceUser(workspaceId)((userId, _) => UsersHandler.updateUser(db, workspaceId, userId, patch))
            }
          }
        }
      }*/

  private def customersRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "customers") { workspaceId =>
      pathEnd {
        post {
          entity(as[PostCustomer]) { post =>
            ensureWorkspaceAdmin(workspaceId)(_ => CustomersHandler.createCustomer(db, workspaceId, post))
          }
        } ~
        get {
          ensureWorkspaceUser(workspaceId)((_, _) => CustomersHandler.readCustomers(db, workspaceId))
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "customers" / IntNumber) { (workspaceId, customerId) =>
        pathEnd {
          patch {
            entity(as[PatchCustomer]) { patch =>
              ensureWorkspaceAdmin(workspaceId)(_ => CustomersHandler.patchCustomer(db, workspaceId, customerId, patch))
            }
          } ~
          delete {
            ensureWorkspaceAdmin(workspaceId)(_ => CustomersHandler.deleteCustomer(db, workspaceId, customerId))
          }
        }
      }

  private def projectsRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "projects") { workspaceId =>
      pathEnd {
        post {
          entity(as[PostProject]) { post =>
            ensureWorkspaceAdmin(workspaceId)(_ => ProjectsHandler.createProject(db, workspaceId, post))
          }
        } ~
        get {
          parameter("customerId".as[Int].?) { maybeCustomerId =>
            ensureWorkspaceUser(workspaceId)((_, globalRoles: Set[GlobalRole]) =>
              ProjectsHandler.readProjects(db, workspaceId, maybeCustomerId, globalRoles)
            )
          }
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "projects" / IntNumber) { (workspaceId, projectId) =>
        pathEnd {
          patch {
            entity(as[PatchProject]) { patch =>
              ensureWorkspaceAdmin(workspaceId)(_ => ProjectsHandler.updateProject(db, workspaceId, projectId, patch))
            }
          } ~
          delete {
            ensureWorkspaceAdmin(workspaceId)(_ => ProjectsHandler.deleteProject(db, workspaceId, projectId))
          }
        }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "projects" / IntNumber / "users" / IntNumber / "roles") {
        (workspaceId, projectId, userId) =>
          pathEnd {
            put {
              entity(as[List[ProjectRole]]) { roles =>
                ensureWorkspaceAdminOrHasProjectRole(workspaceId, projectId, Lead)((_, globalRole) =>
                  ProjectsHandler.updateProjectRoles(db, workspaceId, userId, projectId, roles, globalRole)
                )
              }
            } ~
            get {
              ensureWorkspaceAdminOrHasProjectRole(workspaceId, projectId, Lead, Supervisor, Member)((_, _) =>
                ProjectsHandler.readProjectRoles(db, workspaceId, userId, projectId)
              )
            }
          }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "projects" / IntNumber / "users" / "self" / "roles") {
        (workspaceId, projectId) =>
          pathEnd {
            get {
              ensureWorkspaceAdminOrHasProjectRole(workspaceId, projectId, Lead, Supervisor, Member)(
                (connectedUserId, _) => ProjectsHandler.readProjectRoles(db, workspaceId, connectedUserId, projectId)
              )
            }
          }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "projects" / IntNumber / "users" / "roles") {
        (workspaceId, projectId) =>
          pathEnd {
            get {
              ensureWorkspaceAdminOrHasProjectRole(workspaceId, projectId, Lead, Supervisor, Member)((_, _) =>
                ProjectsHandler.readProjectRolesOfAllUsers(db, workspaceId, projectId)
              )
            }
          }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "projects" / "user" / IntNumber) { (workspaceId, userId) =>
        pathEnd {
          get {
            ensureWorkspaceUser(workspaceId)((_, _) => ProjectsHandler.readUserProjects(db, workspaceId, userId))
          }
        }
      }

  private def activitiesRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "activities") { workspaceId =>
      pathEnd {
        post {
          entity(as[PostActivity]) { newActivity =>
            ensureWorkspaceUser(workspaceId)((connectedUserId, globalRoles) =>
              ensurePostActivityPermissions(workspaceId, connectedUserId, newActivity)(_ =>
                ActivitiesHandler.createActivity(db, workspaceId, globalRoles, newActivity)
              )
            )
          }
        } ~
        get {
          parameters(
            "projectId".as[Int].?,
            "userId".as[Int].?,
            "from".as[java.time.LocalDate].?,
            "to".as[java.time.LocalDate].?
          ) { (maybeProjectId, maybeUserId, maybeFrom, maybeTo) =>
            maybeProjectId.fold(
              ensureWorkspaceAdminOrWorkspaceUser(workspaceId) { _ =>
                ActivitiesHandler.readActivities(db, workspaceId, maybeUserId, maybeProjectId, maybeFrom, maybeTo)
              }(userId =>
                maybeUserId.fold(
                  ActivitiesHandler.readUserProjectsActivities(db, workspaceId, userId, maybeUserId, maybeFrom, maybeTo)
                ) { _ =>
                  ActivitiesHandler.readUserProjectsActivities(db, workspaceId, userId, maybeUserId, maybeFrom, maybeTo)
                }
              )
            ) { projectId =>
              ensureWorkspaceAdminOrHasProjectRole(workspaceId, projectId, Lead, Supervisor, Member) { (_, _) =>
                ActivitiesHandler.readActivities(db, workspaceId, maybeUserId, maybeProjectId, maybeFrom, maybeTo)
              }
            }
          }
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "activities" / IntNumber) { (workspaceId, activityId) =>
        pathEnd {
          patch {
            entity(as[PatchActivity]) { patch =>
              ensureHasPatchDeleteActivityPermissions(workspaceId, activityId, patch.projectId)(
                (_, globalRoles, projectRoles) =>
                  ActivitiesHandler.patchActivity(db, workspaceId, activityId, patch, globalRoles, projectRoles)
              )
            }
          } ~
          delete {
            ensureHasPatchDeleteActivityPermissions(workspaceId, activityId, None)((_, _, _) =>
              ActivitiesHandler.deleteActivity(db, workspaceId, activityId)
            )
          }
        }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "self" / "activities") { (workspaceId: Int) =>
        pathEnd {
          get {
            parameters("projectId".as[Int].?, "from".as[java.time.LocalDate].?, "to".as[java.time.LocalDate].?) {
              (maybeProjectId, maybeFrom, maybeTo) =>
                ensureWorkspaceUser(workspaceId)((userId, _) =>
                  ActivitiesHandler.readActivities(db, workspaceId, Some(userId), maybeProjectId, maybeFrom, maybeTo)
                )
            }
          }
        }
      }

  private def calendarsRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "calendar") { workspaceId =>
      pathEnd {
        post {
          parameter("projectId".as[Int].?) { maybeProjectId =>
            entity(as[PostCalendar]) { calendar =>
              maybeProjectId.fold(
                ensureWorkspaceUser(workspaceId)((connectedUserId, _) =>
                  createCalendar(db, workspaceId, calendar, None, connectedUserId)
                )
              ) { projectId =>
                ensureWorkspaceAdminOrHasProjectRole(workspaceId, projectId, Lead, Supervisor, Member) {
                  (connectedUserId, _) =>
                    createCalendar(db, workspaceId, calendar, Some(projectId), connectedUserId)
                }
              }
            }
          }
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "calendars") { workspaceId =>
        pathEnd {
          get {
            parameter("projectId".as[Int].?, "isPrivate".as[Boolean].?) { (maybeProjectId, isPrivate) =>
              maybeProjectId.fold(
                ensureWorkspaceUser(workspaceId)((id, _) => readGlobalCalendars(db, workspaceId, isPrivate, id))
              ) { projectId =>
                ensureWorkspaceAdminOrHasProjectRole(workspaceId, projectId, Lead, Supervisor, Member)(
                  (connectedUserId, _) => readProjectCalendars(db, workspaceId, projectId, isPrivate, connectedUserId)
                )
              }
            }
          }
        }
      } ~
      pathPrefix("api" / "workspaces" / IntNumber / "calendar" / IntNumber) { (workspaceId, calendarId) =>
        pathEnd {
          get {
            ensureWorkspaceAdminOrHasEventAccess(workspaceId, calendarId) { (_: Int, _: Set[GlobalRole], _: Boolean) =>
              readCalendar(db, workspaceId, calendarId)
            }
          }
        } ~ patch {
          entity(as[PatchCalendar]) { calendarForUpdate =>
            ensureWorkspaceAdminOrCalendarOwner(
              workspaceId,
              calendarId,
              calendarForUpdate.projectId,
              calendarForUpdate.isPrivate
            ) { (globalRoles, oldCalendarInfo, connectedUserId) =>
              updateCalendar(
                db,
                workspaceId,
                calendarId,
                globalRoles,
                calendarForUpdate,
                oldCalendarInfo,
                connectedUserId
              )
            }
          }
        } ~
        delete {
          ensureCalendarOwner(workspaceId, calendarId)(_ => deleteCalendar(db, workspaceId, calendarId))
        }
      }

  private def leavesRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "leaves") { workspaceId =>
      pathEnd {
        post {
          parameter("userId".as[Int].?) { maybeUserId =>
            maybeUserId.fold(entity(as[PostLeave]) { leave =>
              ensureWorkspaceUser(workspaceId)((id, _) => LeavesHandler.createLeave(db, workspaceId, id, leave))
            }) { userId =>
              entity(as[PostLeave]) { leave =>
                ensureWorkspaceAdmin(workspaceId)(_ => LeavesHandler.createLeave(db, workspaceId, userId, leave))
              }
            }
          }
        } ~
        get {
          parameter(
            "usersId".as[Seq[Int]].?,
            "state".as[String].?,
            "from".as[java.time.LocalDate].?,
            "to".as[java.time.LocalDate].?
          ) { (maybeUsersId, maybeState, maybeFrom, maybeTo) =>
            ensureWorkspaceUser(workspaceId)((_, _) =>
              LeavesHandler.readSummaryLeaves(db, workspaceId, maybeUsersId, maybeState, maybeFrom, maybeTo)
            )
          }
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "leaves" / IntNumber) { (workspaceId, leaveId) =>
        pathEnd {
          get {
            ensureWorkspaceAdminOrLeaveOwner(workspaceId, leaveId)((_: Int, _: Set[GlobalRole]) =>
              LeavesHandler.readLeave(db, workspaceId, leaveId)
            )
          } ~
          patch {
            entity(as[PatchLeave]) { leave =>
              ensureWorkspaceAdminOrLeaveOwner(workspaceId, leaveId)((_: Int, _: Set[GlobalRole]) =>
                LeavesHandler.patchLeave(db, workspaceId, leaveId, leave)
              )
            }
          } ~ put {
            entity(as[PutLeave]) { leave =>
              ensureWorkspaceAdminOrLeaveOwner(workspaceId, leaveId)(
                (connectedUserId: Int, globalRoles: Set[GlobalRole]) =>
                  LeavesHandler.putLeave(db, workspaceId, connectedUserId, leaveId, leave, globalRoles)
              )
            }
          }
        }
      }

  private def eventsRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "events") { (workspaceId: Int) =>
      pathEnd {
        post {
          entity(as[PostEvent]) { event =>
            ensureWorkspaceAdminOrHasEventAccess(workspaceId, event.calendarId)(
              (connectedUserId: Int, globalRoles: Set[GlobalRole], _: Boolean) =>
                EventsHandler.createEvent(db, workspaceId, event, globalRoles, connectedUserId)
            )
          }
        } ~ get {
          parameter("calendarId".as[Int].?, "isPrivate".as[Boolean].?) { (maybeCalendarId, maybeIsPrivate) =>
            maybeCalendarId.fold(
              ensureWorkspaceUser(workspaceId)((connectedUserId: Int, _: Set[GlobalRole]) =>
                EventsHandler.readEvents(db, workspaceId, connectedUserId, None, maybeIsPrivate)
              )
            ) { (calendarId: Int) =>
              ensureWorkspaceAdminOrHasEventAccess(workspaceId, calendarId)(
                (connectedUserId: Int, _: Set[GlobalRole], _: Boolean) =>
                  EventsHandler.readEvents(db, workspaceId, connectedUserId, maybeCalendarId, maybeIsPrivate)
              )
            }
          }
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "events" / IntNumber) { (workspaceId: Int, eventId: Int) =>
        pathEnd {
          get {
            EventPermissionCheck(workspaceId, eventId)((connectedUserId: Int, _: Set[GlobalRole], _: Boolean) =>
              EventsHandler.readEvent(db, workspaceId, connectedUserId, eventId)
            )
          } ~
          patch {
            entity(as[PatchEvent]) { (patchEvent: PatchEvent) =>
              patchEvent.calendarId match {
                case Some(calendarId) =>
                  ensureWorkspaceAdminOrHasEventAccess(workspaceId, calendarId)(
                    (connectedUserId: Int, globalRoles: Set[GlobalRole], isPrivatePatchCalendar: Boolean) =>
                      EventsHandler.updateEvent(
                        db,
                        workspaceId,
                        eventId,
                        patchEvent,
                        connectedUserId,
                        globalRoles,
                        isPrivatePatchCalendar
                      )
                  )
                case _                =>
                  ensureWorkspaceUser(workspaceId)((_: Int, _: Set[GlobalRole]) =>
                    EventPermissionCheck(workspaceId, eventId)(
                      (connectedUserId: Int, globalRoles: Set[GlobalRole], isPrivatePatchCalendar: Boolean) =>
                        EventsHandler.updateEvent(
                          db,
                          workspaceId,
                          eventId,
                          patchEvent,
                          connectedUserId,
                          globalRoles,
                          isPrivatePatchCalendar
                        )
                    )
                  )
              }
            }
          } ~
          delete {
            ensureWorkspaceUser(workspaceId)((_, globalRoles) =>
              Await
                .result(checkEventExists(db, workspaceId, eventId), Duration.Inf)
                .fold[Route](
                  if (globalRoles.contains(GlobalRole.Administrator))
                    complete(StatusCodes.NotFound, Failure("Event not found."))
                  else complete(StatusCodes.Forbidden, Failure("Forbidden or workspace not found."))
                ) { (calendarId: Int) =>
                  ensureWorkspaceAdminOrHasEventAccess(workspaceId, calendarId)(
                    (_: Int, _: Set[GlobalRole], _: Boolean) => EventsHandler.deleteEvent(db, workspaceId, eventId)
                  )
                }
            )
          }
        }
      }

  private def tasksRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "taskLists") { workspaceId =>
      pathEnd {
        post {
          entity(as[PostTask]) { postTask =>
            ensureWorkspaceAdmin(workspaceId)(_ => TasksHandler.createTask(db, workspaceId, postTask))
          }
        } ~
        get {
          ensureWorkspaceAdmin(workspaceId)(_ => TasksHandler.readTasks(db, workspaceId))
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "taskLists" / IntNumber) { (workspaceId, taskListId) =>
        pathEnd {
          patch {
            entity(as[PatchTask]) { patchTask =>
              ensureWorkspaceAdmin(workspaceId)(_ => TasksHandler.updateTask(db, workspaceId, taskListId, patchTask))
            }
          } ~
          delete {
            ensureWorkspaceAdmin(workspaceId)(_ => TasksHandler.deleteTask(db, workspaceId, taskListId))
          }
        }
      }

  private def cardsRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "cards") { workspaceId =>
      pathEnd {
        post {
          entity(as[PostCard]) { postCard =>
            ensureWorkspaceAdmin(workspaceId)(_ => CardsHandler.createCard(db, workspaceId, postCard))
          }
        } ~
        get {
          parameter("projectId".as[Int].?) { maybeProjectId =>
            maybeProjectId.fold(
              ensureWorkspaceAdminOrWorkspaceUser(workspaceId)(_ =>
                CardsHandler.readCards(db, workspaceId, maybeProjectId)
              )(userId => CardsHandler.readItsProjectsCards(db, workspaceId, userId))
            ) { projectId =>
              ensureWorkspaceAdminOrHasProjectRole(workspaceId, projectId, Lead, Supervisor, Member)((_, _) =>
                CardsHandler.readCards(db, workspaceId, Some(projectId))
              )
            }
          }
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "cards" / IntNumber) { (workspaceId, cardId) =>
        pathEnd {
          patch {
            entity(as[PatchCard]) { patchCard =>
              ensureWorkspaceAdmin(workspaceId)(_ => CardsHandler.patchCard(db, workspaceId, cardId, patchCard))
            }
          } ~
          delete {
            ensureWorkspaceAdmin(workspaceId)(_ => CardsHandler.deleteCard(db, workspaceId, cardId))
          }
        }
      }

  private def notificationsRoutes(db: Databases): Route =
    pathPrefix("api" / "workspaces" / IntNumber / "notification") { workspaceId =>
      pathEnd {
        get {
          parameter("userId".as[Int]) { userId =>
            ensureWorkspaceUser(workspaceId) { (_, _) =>
              NotificationHandler.readUserNotification(db, workspaceId, userId)
            }
          }
        } ~
        delete {
          parameter("userId".as[Int]) { userId =>
            ensureWorkspaceUser(workspaceId) { (_, _) =>
              NotificationHandler.deleteAllNotification(db, workspaceId, userId)
            }
          }
        } ~
        post {
          parameter("userId".as[Int]) { userId =>
            ensureWorkspaceUser(workspaceId) { (_, _) =>
              NotificationHandler.marAllAsRead(db, workspaceId, userId)
            }
          }
        } ~
        patch {
          parameter("notificationId".as[Int]) { notificationId =>
            ensureWorkspaceUser(workspaceId) { (_, _) =>
              NotificationHandler.markAsRead(db, workspaceId, notificationId)
            }
          }
        }
      }
    } ~
      pathPrefix("api" / "workspaces" / IntNumber / "notification" / IntNumber) { (workspaceId, notificationId) =>
        pathEnd {
          delete {
            ensureWorkspaceUser(workspaceId) { (_, _) =>
              NotificationHandler.deleteNotification(db, workspaceId, notificationId)
            }
          }
        }
      }

}
