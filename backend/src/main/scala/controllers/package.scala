import api.generated.calendars.Calendar
import api.generated.cards.Card
import api.generated.customers.Customer
import api.generated.events.Event
import api.generated.leaves.{Leave, SummaryLeave}
import api.generated.projects.{Activity, Project}
import api.generated.sessions.Notification
import api.generated.tasks.Task
import api.generated.users.User
import api.generated.workspaces.Workspace
import api.generated.calendars.Calendar
import api.generated.events.Event
import db.{
  Activity as DbActivity, Calendar as DbCalendar, Card as DbCard, Customer as DbCustomer, Event as DbEvent,
  Leave as DbLeave, Notification as DbNotification, Project as DbProject, SummaryLeave as DbSummaryLeave,
  Task as DbTask, User as DbUser, Workspace as DbWorkspace
}
import io.circe.generic.auto.*
import io.circe.syntax.*

import java.time.{Instant, ZoneId}

package object controllers {
  extension (ws: DbWorkspace)
    def toRest: Workspace = Workspace(
      id = ws.id,
      name = ws.name,
      description = ws.description,
      isActive = ws.active
    )

  extension (user: DbUser)
    def toRest: User = User(
      id = user.userId,
      firstName = user.firstName,
      lastName = user.lastName,
      login = user.login,
      email = user.email,
      note = user.note,
      isActive = user.active
    )

  extension (customer: DbCustomer)
    def toRest: Customer = Customer(
      id = customer.id,
      name = customer.name,
      description = customer.description,
      note = customer.note,
      isActive = customer.active
    )

  extension (project: DbProject)
    def toRest: Project = Project(
      id = project.projectId,
      customerId = project.customerId,
      name = project.name,
      description = project.description,
      note = project.note,
      isActive = project.active
    )

  extension (activity: DbActivity)
    def toRest: Activity = Activity(
      id = activity.activityId,
      userId = activity.userId,
      projectId = activity.projectId,
      start = Instant.ofEpochMilli(activity.start),
      description = activity.description,
      end = activity.end.map(Instant.ofEpochMilli)
    )

  extension (calendar: DbCalendar)
    def toRest: Calendar = Calendar(
      id = calendar.calendarId,
      name = calendar.name,
      projectId = calendar.projectId,
      description = calendar.description,
      isPrivate = calendar.isPrivate,
      userId = calendar.userId,
      timeZone = calendar.timeZone
    )

  extension (leave: DbLeave)
    def toRest: Leave = Leave(
      id = leave.leaveId,
      start = Instant.ofEpochSecond(leave.start).atZone(ZoneId.systemDefault).toLocalDate,
      isFullDayStart = leave.isFullDayStart,
      end = Instant.ofEpochSecond(leave.end).atZone(ZoneId.systemDefault).toLocalDate,
      isFullDayEnd = leave.isFullDayEnd,
      daysNumber = leave.daysNumber,
      userId = leave.userId,
      leaveType = leave.adaptedLeaveType.toString,
      description = leave.description,
      state = leave.adaptedLeaveState.toString,
      comment = leave.comment
    )

  extension (summaryLeave: DbSummaryLeave)
    def toRest: SummaryLeave = SummaryLeave(
      id = summaryLeave.leaveId,
      start = Instant.ofEpochSecond(summaryLeave.start).atZone(ZoneId.systemDefault).toLocalDate,
      isFullDayStart = summaryLeave.isFullDayStart,
      end = Instant.ofEpochSecond(summaryLeave.end).atZone(ZoneId.systemDefault).toLocalDate,
      isFullDayEnd = summaryLeave.isFullDayEnd,
      daysNumber = summaryLeave.daysNumber,
      userId = summaryLeave.userId,
      leaveType = summaryLeave.leaveType.toString,
      state = summaryLeave.state.toString
    )

  extension (event: DbEvent)
    def toRest: Event = Event(
      id = event.eventId,
      calendarId = event.calendarId,
      isPrivateCalendar = event.isPrivateCalendar,
      start = Instant.ofEpochMilli(event.start).atZone(ZoneId.systemDefault).toInstant,
      end = Instant.ofEpochMilli(event.end).atZone(ZoneId.systemDefault).toInstant,
      title = event.title,
      description = event.description,
      repetition = event.adaptedRepetitive.toString,
      allDay = event.allDay,
      eventType = event.adaptedEventType.toString,
      creator = event.creator
    )

  extension (task: DbTask)
    def toRest: Task = Task(
      id = task.taskId,
      name = task.name,
      key = task.key,
      index = task.index
    )

  extension (card: DbCard)
    def toRest: Card         = Card(
      id = card.cardId,
      status = card.status.toString,
      projectId = card.projectId,
      project = card.project,
      cardType = card.cardType.toString,
      title = card.title,
      assignee = card.assignee,
      priority = card.priority.toString,
      storyPoints = card.storyPoints,
      tags = card.tags,
      summary = card.summary
    )
  extension (notification: DbNotification)
    def toRest: Notification = Notification(
      id = notification.id.getOrElse(0),
      notifiedUser = notification.notifiedUser,
      description = notification.description,
      notificationType = notification.notificationType.toString,
      createdAt = Instant.ofEpochMilli(notification.createdAt),
      userId = notification.userId,
      url = notification.url,
      isRead = notification.isRead
    )

}
