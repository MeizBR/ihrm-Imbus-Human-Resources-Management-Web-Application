package db

import api.enumeration.{CardType, EventType, GlobalRole, LeaveType, Priority, ProjectRole, Repetitive, State, Status}
import api.enumeration.ProjectRole.{Lead, Member, Supervisor}
import api.enumeration._

import java.time.Instant

case class SuperAdmin(id: Int, login: String, hashedPassword: String, active: Boolean)

case class Workspace(id: Int, name: String, description: String, active: Boolean)

case class Customer(workspaceId: Int, id: Int, name: String, description: String, note: String, active: Boolean)
case class Notification(
    workspaceId: Int,
    id: Option[Int] = None,
    notifiedUser: Int,
    description: String,
    url: String,
    userId: Option[Int],
    notificationType: NotificationType,
    createdAt: Long = Instant.now().toEpochMilli,
    isRead: Boolean = false
)

case class Project(
    workspaceId: Int,
    projectId: Int,
    customerId: Int,
    name: String,
    description: String,
    note: String,
    active: Boolean,
    isDeleted: Boolean
)

case class User(
    workspaceId: Int,
    userId: Int,
    firstName: String,
    lastName: String,
    login: String,
    email: String,
    note: String,
    hashedPassword: String,
    admin: Boolean,
    manager: Boolean,
    active: Boolean
) {
  def globalRoles: Set[GlobalRole] = Map[GlobalRole, Boolean](
    GlobalRole.Administrator  -> admin,
    GlobalRole.AccountManager -> manager
  ).filter(_._2).keySet
}

case class ProjectUser(
    workspaceId: Int,
    id: Int,
    projectId: Int,
    userId: Int,
    lead: Boolean,
    supervisor: Boolean,
    member: Boolean
) {
  def roles: Set[ProjectRole] = Map[ProjectRole, Boolean](
    Lead       -> lead,
    Supervisor -> supervisor,
    Member     -> member
  ).filter(_._2).keySet
}
case class Activity(
    workspaceId: Int,
    activityId: Int,
    userId: Int,
    description: String,
    projectId: Int,
    start: Long,
    end: Option[Long]
)

case class Calendar(
    workspaceId: Int,
    calendarId: Int,
    name: String,
    projectId: Option[Int],
    description: String,
    isPrivate: Boolean,
    userId: Int,
    timeZone: String
)

case class Leave(
    workspaceId: Int,
    leaveId: Int,
    start: Long,
    isFullDayStart: Boolean,
    end: Long,
    isFullDayEnd: Boolean,
    daysNumber: Double,
    userId: Int,
    leaveType: Byte,
    description: String,
    state: Byte,
    comment: String
) {
  val adaptedLeaveType: LeaveType =
    LeaveType.value(leaveType).getOrElse(throw new MatchError(s"Invalid enumeration index $leaveType for LeaveType"))

  val adaptedLeaveState: State =
    State.value(state).getOrElse(throw new MatchError(s"invalid enumeration with value $state for state"))
}

case class SummaryLeave(
    workspaceId: Int,
    leaveId: Int,
    start: Long,
    isFullDayStart: Boolean,
    end: Long,
    isFullDayEnd: Boolean,
    daysNumber: Double,
    userId: Int,
    leaveType: LeaveType,
    state: State
)

case class Event(
    eventId: Int,
    workspaceId: Int,
    calendarId: Int,
    isPrivateCalendar: Boolean,
    start: Long,
    end: Long,
    title: String,
    description: String,
    repetition: Byte,
    allDay: Boolean,
    eventType: Byte,
    creator: Int
) {
  val adaptedEventType: EventType   = EventType
    .value(eventType)
    .getOrElse(throw new MatchError(s"invalid enumeration with value $eventType for eventType"))
  val adaptedRepetitive: Repetitive =
    Repetitive
      .value(repetition)
      .getOrElse(throw new MatchError(s"invalid enumeration with value $repetition for repetition"))
}

case class Task(taskId: Int, workspaceId: Int, name: String, key: String, index: Int)

case class Card(
    workspaceId: Int,
    cardId: Int,
    status: Status,
    projectId: Int,
    project: String,
    cardType: CardType,
    title: String,
    assignee: String,
    priority: Priority,
    storyPoints: Double,
    tags: String,
    summary: String
)

case class DbVersion(version: String)
