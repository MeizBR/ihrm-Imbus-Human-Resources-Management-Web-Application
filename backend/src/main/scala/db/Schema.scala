package db

import api.enumeration.{CardType, Priority, Status}
import api.enumeration._
import slick.lifted.ProvenShape

trait Schema extends DbConfiguration with ColumnTypes {

  import ColumnTypes._
  import config.profile.api._

  val currentDbVersion = "1.0.0"

  val superAdmins   = TableQuery[SuperAdmins]
  val workspaces    = TableQuery[Workspaces]
  val customers     = TableQuery[Customers]
  val projects      = TableQuery[Projects]
  val users         = TableQuery[Users]
  val projectUsers  = TableQuery[ProjectUsers]
  val activities    = TableQuery[Activities]
  val calendars     = TableQuery[Calendars]
  val leaves        = TableQuery[Leaves]
  val tasks         = TableQuery[Tasks]
  val cards         = TableQuery[Cards]
  val events        = TableQuery[Events]
  val dbVersions    = TableQuery[DbVersions]
  val notifications = TableQuery[Notifications]

  type BasicTable[A] = config.profile.Table[A]

  class SuperAdmins(tag: Tag) extends BasicTable[SuperAdmin](tag, _tableName = "superadmins") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def login: Rep[String] = column[String]("login", O.Unique)

    def hashedPassword: Rep[String] = column[String]("password")

    def active: Rep[Boolean] = column[Boolean]("active")

    def * : ProvenShape[SuperAdmin] = (id, login, hashedPassword, active).mapTo[SuperAdmin]
  }

  class Workspaces(tag: Tag)    extends BasicTable[Workspace](tag, _tableName = "workspaces")       {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def name: Rep[String] = column[String]("name", O.Unique)

    def description: Rep[String] = column[String]("description")

    def active: Rep[Boolean] = column[Boolean]("active")

    def * : ProvenShape[Workspace] = (id, name, description, active).mapTo[Workspace]
  }
  class Notifications(tag: Tag) extends BasicTable[Notification](tag, _tableName = "Notifications") {
    def id: Rep[Int]          = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def description: Rep[String]                = column[String]("description")
    def url: Rep[String]                        = column[String]("url")
    def notifiedUser: Rep[Int]                  = column[Int]("notifiedUser")
    def userId: Rep[Option[Int]]                = column[Option[Int]]("userId")
    def notificationType: Rep[NotificationType] = column[NotificationType]("notificationType")

    def createdAt: Rep[Long] = column[Long]("createdAt")
    def isRead: Rep[Boolean] = column[Boolean]("isRead")

    def * : ProvenShape[Notification] =
      (workspaceId, id.?, notifiedUser, description, url, userId, notificationType, createdAt, isRead)
        .mapTo[Notification]

  }

  class Customers(tag: Tag) extends BasicTable[Customer](tag, _tableName = "customers") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def name: Rep[String] = column[String]("name")

    def description: Rep[String] = column[String]("description")

    def note: Rep[String] = column[String]("note")

    def active: Rep[Boolean] = column[Boolean]("active")

    def * : ProvenShape[Customer] = (workspaceId, id, name, description, note, active).mapTo[Customer]

    def idx1 = index(name = "customers_wsid", on = workspaceId, unique = false)

    def idx2 = index(name = "customers_wsid_name", on = (workspaceId, name), unique = true)
  }

  class Projects(tag: Tag) extends BasicTable[Project](tag, _tableName = "projects") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def customerId: Rep[Int] = column[Int]("customerId")

    def name: Rep[String] = column[String]("name")

    def description: Rep[String] = column[String]("description")

    def note: Rep[String] = column[String]("note")

    def active: Rep[Boolean] = column[Boolean]("active")

    def isDeleted: Rep[Boolean] = column[Boolean]("isDeleted")

    def * : ProvenShape[Project] =
      (workspaceId, id, customerId, name, description, note, active, isDeleted).mapTo[Project]

    def idx1 = index(name = "projects_wsid_name_cid", on = (workspaceId, name, customerId), unique = true)
  }

  class Users(tag: Tag) extends BasicTable[User](tag, _tableName = "users") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def firstName: Rep[String] = column[String]("firstName")

    def lastName: Rep[String] = column[String]("lastName")

    def login: Rep[String] = column[String]("login")

    def email: Rep[String] = column[String]("email")

    def note: Rep[String] = column[String]("note")

    def hashedPassword: Rep[String] = column[String]("hashedPassword")

    def admin: Rep[Boolean] = column[Boolean]("admin")

    def manager: Rep[Boolean] = column[Boolean]("manager")

    def active: Rep[Boolean] = column[Boolean]("active")

    def * : ProvenShape[User] =
      (workspaceId, id, firstName, lastName, login, email, note, hashedPassword, admin, manager, active).mapTo[User]

    def idx1 = index(name = "users_wsid_login", on = (workspaceId, login), unique = true)

    def idx2 = index(name = "users_wsid_email", on = (workspaceId, email), unique = true)
  }

  class ProjectUsers(tag: Tag) extends BasicTable[ProjectUser](tag, _tableName = "projectusers") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def projectId: Rep[Int] = column[Int]("projectId")

    def userId: Rep[Int] = column[Int]("userId")

    def lead: Rep[Boolean] = column[Boolean]("lead")

    def supervisor: Rep[Boolean] = column[Boolean]("supervisor")

    def member: Rep[Boolean] = column[Boolean]("member")

    def * : ProvenShape[ProjectUser] = (workspaceId, id, projectId, userId, lead, supervisor, member).mapTo[ProjectUser]
  }

  class Activities(tag: Tag) extends BasicTable[Activity](tag, _tableName = "activities") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def userId: Rep[Int] = column[Int]("userId")

    def projectId: Rep[Int] = column[Int]("projectId")

    def description: Rep[String] = column[String]("description")

    def start: Rep[Long] = column[Long]("start")

    def end: Rep[Option[Long]] = column[Option[Long]]("end")

    def * : ProvenShape[Activity] = (workspaceId, id, userId, description, projectId, start, end).mapTo[Activity]

    def idx1 = index(name = "activities_wsid", on = workspaceId, unique = false)

    def idx2 = index(name = "activities_prid", on = projectId, unique = false)

    def idx3 = index(name = "activities_uid", on = userId, unique = false)

    def idx4 = index(name = "activities_start", on = start, unique = false)

    def idx5 = index(name = "activities_end", on = end, unique = false)
  }

  class Calendars(tag: Tag) extends BasicTable[Calendar](tag, _tableName = "calendars") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def name: Rep[String] = column[String]("name")

    def projectId: Rep[Option[Int]] = column[Option[Int]]("projectId")

    def description: Rep[String] = column[String]("description")

    def isPrivate: Rep[Boolean] = column[Boolean]("isPrivate")

    def userId: Rep[Int] = column[Int]("userId")

    def timeZone: Rep[String] = column[String]("timeZone")

    def * : ProvenShape[Calendar] =
      (workspaceId, id, name, projectId, description, isPrivate, userId, timeZone).mapTo[Calendar]
  }

  class Leaves(tag: Tag) extends BasicTable[Leave](tag, _tableName = "leaves") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def start: Rep[Long] = column[Long]("start")

    def isFullDayStart: Rep[Boolean] = column[Boolean]("isFullDayStart")

    def end: Rep[Long] = column[Long]("end")

    def isFullDayEnd: Rep[Boolean] = column[Boolean]("isFullDayEnd")

    def daysNumber: Rep[Double] = column[Double]("daysNumber")

    def userId: Rep[Int] = column[Int]("userId")

    def leaveType: Rep[Byte] = column[Byte]("leaveType")

    def description: Rep[String] = column[String]("description")

    def state: Rep[Byte] = column[Byte]("state")

    def comment: Rep[String] = column[String]("comment")

    def * : ProvenShape[Leave] =
      (
        workspaceId,
        id,
        start,
        isFullDayStart,
        end,
        isFullDayEnd,
        daysNumber,
        userId,
        leaveType,
        description,
        state,
        comment
      ).mapTo[Leave]

    def idx1 = index(name = "leaves_wsid", on = workspaceId, unique = false)
  }

  class Events(tag: Tag) extends BasicTable[Event](tag, _tableName = "events") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def calendarId: Rep[Int] = column[Int]("calendarId")

    def isPrivateCalendar: Rep[Boolean] = column[Boolean]("isPrivateCalendar")

    def start: Rep[Long] = column[Long]("start")

    def end: Rep[Long] = column[Long]("end")

    def title: Rep[String] = column[String]("title")

    def description: Rep[String] = column[String]("description")

    def repetition: Rep[Byte] = column[Byte]("repetition")

    def allDay: Rep[Boolean] = column[Boolean]("allDay")

    def eventType: Rep[Byte] = column[Byte]("eventType")

    def creator: Rep[Int] = column[Int]("creator")

    def * : ProvenShape[Event] = (
      id,
      workspaceId,
      calendarId,
      isPrivateCalendar,
      start,
      end,
      title,
      description,
      repetition,
      allDay,
      eventType,
      creator
    ).mapTo[Event]

    def idx1 = index(name = "events_wsid", on = workspaceId, unique = false)

    def idx2 = index(name = "events_calid", on = calendarId, unique = false)
  }

  class Tasks(tag: Tag) extends BasicTable[Task](tag, _tableName = "tasks") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def name: Rep[String] = column[String]("name")

    def key: Rep[String] = column[String]("key")

    def index: Rep[Int] = column[Int]("index")

    def * : ProvenShape[Task] = (id, workspaceId, name, key, index).mapTo[Task]

    def idx1 = index(name = "tasks_wsid", on = workspaceId, unique = false)

    def idx2 = index(name = "tasks_wsid_name", on = (workspaceId, name), unique = false)
  }

  class Cards(tag: Tag) extends BasicTable[Card](tag, _tableName = "cards") {
    def id: Rep[Int] = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def workspaceId: Rep[Int] = column[Int]("workspaceId")

    def status: Rep[Status] = column[Status]("status")

    def projectId: Rep[Int] = column[Int]("projectId")

    def project: Rep[String] = column[String]("project")

    def cardType: Rep[CardType] = column[CardType]("cardType")

    def title: Rep[String] = column[String]("title")

    def assignee: Rep[String] = column[String]("assignee")

    def priority: Rep[Priority] = column[Priority]("priority")

    def storyPoints: Rep[Double] = column[Double]("storyPoints")

    def tags: Rep[String] = column[String]("tags")

    def summary: Rep[String] = column[String]("summary")

    def * : ProvenShape[Card] =
      (workspaceId, id, status, projectId, project, cardType, title, assignee, priority, storyPoints, tags, summary)
        .mapTo[Card]

    def idx1 = index(name = "cards_wsid", on = workspaceId, unique = false)
  }

  final class DbVersions(tag: Tag) extends BasicTable[DbVersion](tag, _tableName = "ihrmVersion") {
    def version: Rep[String] = column[String]("version")

    def * : ProvenShape[DbVersion] = version.mapTo[DbVersion]
  }
}
