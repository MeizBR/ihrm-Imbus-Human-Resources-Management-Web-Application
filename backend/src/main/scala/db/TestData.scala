package db

import api.enumeration.{CardType, EventType, LeaveType, Priority, Repetitive, State, Status}
import models.Cards._
import utils.HashedString

import scala.concurrent.ExecutionContext.Implicits.global

trait TestData extends DbConfiguration {

  import config.profile.api._
  import api.enumeration._

  lazy val addWorkSpaces = DBIO.seq(
    workspaces += Workspace(id = 1, name = "imbus", description = "new Description", active = true),
    workspaces += Workspace(id = 2, name = "diligate", description = "new Description", active = true),
    workspaces += Workspace(id = 3, name = "randomWorkspace", description = "new Description", active = true)
  )
  lazy val addCustomers  = DBIO.seq(
    customers += Customer(workspaceId = 1, id = 1, name = "Customer 1", description = "", note = "", active = true),
    customers += Customer(workspaceId = 1, id = 2, name = "Customer 2", description = "", note = "", active = true),
    customers += Customer(workspaceId = 1, id = 3, name = "Customer 3", description = "", note = "", active = true)
  )

  lazy val addProjects = DBIO.seq(
    projects += Project(
      workspaceId = 1,
      projectId = 1,
      customerId = 1,
      name = "Project A1",
      description = "New description",
      note = "note for project A1",
      active = true,
      isDeleted = false
    ),
    projects += Project(
      workspaceId = 1,
      projectId = 2,
      customerId = 2,
      name = "Project B1",
      description = "New description",
      note = "note for project B1",
      active = true,
      isDeleted = false
    ),
    projects += Project(
      workspaceId = 1,
      projectId = 3,
      customerId = 2,
      name = "Project C1",
      description = "New description",
      note = "note for project C1",
      active = true,
      isDeleted = false
    )
  )

  lazy val addUsers = DBIO.seq(
    users += User(
      workspaceId = 1,
      userId = 1,
      firstName = "Mouelhi",
      lastName = "Amel",
      login = "admin",
      email = "admin@gmail.com",
      note = "",
      hashedPassword = "admin".hashed,
      admin = true,
      manager = false,
      active = true
    ),
    users += User(
      workspaceId = 1,
      userId = 2,
      firstName = "Chouaib",
      lastName = "Samir",
      login = "manager",
      email = "manager@gmail.com",
      note = "",
      hashedPassword = "manager".hashed,
      admin = false,
      manager = true,
      active = true
    ),
    users += User(
      workspaceId = 1,
      userId = 3,
      firstName = "Baccouche",
      lastName = "Ghafer",
      login = "lead",
      email = "lead@gmail.com",
      note = "",
      hashedPassword = "lead".hashed,
      admin = false,
      manager = false,
      active = true
    ),
    users += User(
      workspaceId = 1,
      userId = 4,
      firstName = "Chouaib",
      lastName = "Swayah",
      login = "supervisor",
      email = "supervisor@gmail.com",
      note = "",
      hashedPassword = "supervisor".hashed,
      admin = false,
      manager = false,
      active = true
    ),
    users += User(
      workspaceId = 1,
      userId = 5,
      firstName = "Ayedi",
      lastName = "Hejer",
      login = "member",
      email = "member@gmail.com",
      note = "",
      hashedPassword = "member".hashed,
      admin = false,
      manager = false,
      active = true
    ),
    users += User(
      workspaceId = 1,
      userId = 6,
      firstName = "Said",
      lastName = "Med Bechir",
      login = "member.login",
      email = "member.email@gmail.com",
      note = "",
      hashedPassword = "member".hashed,
      admin = false,
      manager = true,
      active = true
    )
  )

  lazy val addProjectUsers = DBIO.seq(
    projectUsers += ProjectUser(
      workspaceId = 1,
      id = 1,
      projectId = 1,
      userId = 3,
      lead = true,
      supervisor = false,
      member = false
    ),
    projectUsers += ProjectUser(
      workspaceId = 1,
      id = 2,
      projectId = 2,
      userId = 4,
      lead = false,
      supervisor = true,
      member = false
    ),
    projectUsers += ProjectUser(
      workspaceId = 1,
      id = 3,
      projectId = 3,
      userId = 5,
      lead = false,
      supervisor = false,
      member = true
    ),
    projectUsers += ProjectUser(
      workspaceId = 1,
      id = 4,
      projectId = 3,
      userId = 4,
      lead = false,
      supervisor = false,
      member = true
    ),
    projectUsers += ProjectUser(
      workspaceId = 1,
      id = 5,
      projectId = 1,
      userId = 4,
      lead = false,
      supervisor = true,
      member = false
    ),
    projectUsers += ProjectUser(
      workspaceId = 1,
      id = 6,
      projectId = 1,
      userId = 6,
      lead = false,
      supervisor = false,
      member = true
    )
  )

  lazy val addActivities = DBIO.seq(
    activities += Activity(
      workspaceId = 1,
      activityId = 1,
      userId = 4,
      description = "Supervisor activity without projectId",
      projectId = 3,
      start = 0,
      Some(0)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 2,
      userId = 5,
      description = "Member activity in project 3",
      projectId = 3,
      start = 0,
      Some(0)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 3,
      userId = 3,
      description = "Lead activity in project 1",
      projectId = 1,
      start = 0,
      Some(0)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 4,
      userId = 3,
      description = "Lead activity in project 1",
      projectId = 1,
      start = 1622793600299L,
      Some(1622793611299L)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 5,
      userId = 3,
      description = "Lead activity in project 1",
      projectId = 1,
      start = 1619856600299L,
      Some(1619860200299L)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 6,
      userId = 3,
      description = "Lead activity in project 1",
      projectId = 1,
      start = 1577866320299L,
      Some(1577872380299L)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 7,
      userId = 3,
      description = "Lead activity in project 1",
      projectId = 1,
      start = 1581333120299L,
      Some(1581336060299L)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 8,
      userId = 1,
      description = "Admin activity in project 3",
      projectId = 3,
      start = 1581333120299L,
      Some(1581336060299L)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 9,
      userId = 4,
      description = "Supervisor activity in project 1",
      projectId = 1,
      start = 1581333120299L,
      Some(1581336060299L)
    ),
    activities += Activity(
      workspaceId = 1,
      activityId = 10,
      userId = 4,
      description = "Supervisor activity in project 2",
      projectId = 2,
      start = 1581333120299L,
      Some(1581336060299L)
    )
  )

  lazy val addCalenders = DBIO.seq(
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 1,
      name = "Calendar 1",
      projectId = None,
      description = "public without project",
      isPrivate = false,
      userId = 1,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 2,
      name = "Calendar 2",
      projectId = Some(1),
      description = "public in project 1",
      isPrivate = false,
      userId = 1,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 3,
      name = "Calendar 3",
      projectId = Some(2),
      description = "public in project 2",
      isPrivate = false,
      userId = 1,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 4,
      name = "Calendar 4",
      projectId = Some(3),
      description = "public in project 3",
      isPrivate = false,
      userId = 1,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 5,
      name = "Calendar 5",
      projectId = None,
      description = "private without project",
      isPrivate = true,
      userId = 1,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 6,
      name = "Calendar 6",
      projectId = Some(1),
      description = "private in project 1",
      isPrivate = true,
      userId = 1,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 7,
      name = "Calendar 7",
      projectId = Some(2),
      description = "private in project 2",
      isPrivate = true,
      userId = 1,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 8,
      name = "Calendar 8",
      projectId = Some(3),
      description = "private in project 3",
      isPrivate = true,
      userId = 1,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 9,
      name = "Calendar 9",
      projectId = None,
      description = "public without project",
      isPrivate = false,
      userId = 3,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 10,
      name = "Calendar 10",
      projectId = Some(1),
      description = "public in project 1",
      isPrivate = false,
      userId = 3,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 11,
      name = "Calendar 11",
      projectId = None,
      description = "private without project",
      isPrivate = true,
      userId = 3,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 12,
      name = "Calendar 12",
      projectId = Some(1),
      description = "private in project 1",
      isPrivate = true,
      userId = 3,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 13,
      name = "Calendar 13",
      projectId = None,
      description = "public without project",
      isPrivate = false,
      userId = 5,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 14,
      name = "Calendar 14",
      projectId = Some(3),
      description = "public in project 3",
      isPrivate = false,
      userId = 5,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 15,
      name = "Calendar 15",
      projectId = None,
      description = "private without project",
      isPrivate = true,
      userId = 5,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 16,
      name = "Calendar 16",
      projectId = Some(3),
      description = "private in project 3",
      isPrivate = true,
      userId = 5,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 17,
      name = "Calendar 17",
      projectId = None,
      description = "public without project",
      isPrivate = false,
      userId = 4,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 18,
      name = "Calendar 18",
      projectId = Some(3),
      description = "public in project 3",
      isPrivate = false,
      userId = 4,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 19,
      name = "Calendar 19",
      projectId = None,
      description = "private without project",
      isPrivate = true,
      userId = 4,
      timeZone = "Africa/Tunis"
    ),
    calendars += Calendar(
      workspaceId = 1,
      calendarId = 20,
      name = "Calendar 20",
      projectId = Some(3),
      description = "private in project 3",
      isPrivate = true,
      userId = 4,
      timeZone = "Africa/Tunis"
    )
  )

  lazy val addEvents = DBIO.seq(
    events += Event(
      eventId = 1,
      workspaceId = 1,
      calendarId = 1,         // public global
      isPrivateCalendar = false,
      start = 1609488000000L, // "2021-01-01T08:00:00.00Z"
      end = 1609491600000L,   //  "2021-01-01T09:00:00.00Z"
      title = "Event 1",
      description = "public project 1 calendar: userId 1",
      eventType = EventType.Meeting.id,
      repetition = Repetitive.Daily.id,
      allDay = false,
      creator = 1
    ),
    events += Event(
      eventId = 2,
      workspaceId = 1,
      calendarId = 4,         // public project 3
      isPrivateCalendar = false,
      start = 1604217600000L, // "2020-11-01T08:00:00.00Z"
      end = 1604242800000L,   //  "2020-11-01T15:00:00.00Z"
      title = "Event 2",
      description = "public project 3 calendar: userId 5",
      eventType = EventType.Meeting.id,
      repetition = Repetitive.Daily.id,
      allDay = false,
      creator = 5
    ),
    events += Event(
      eventId = 3,
      workspaceId = 1,
      calendarId = 14,        // public global
      isPrivateCalendar = false,
      start = 1570284000000L, // "2019-10-05T14:00:00.00Z"
      end = 1570374000000L,   //  "2019-10-06T15:00:00.00Z"
      title = "Event 3",
      description = "global public calendar: userId 1",
      eventType = EventType.Meeting.id,
      repetition = Repetitive.Daily.id,
      allDay = false,
      creator = 1
    ),
    events += Event(
      eventId = 4,
      workspaceId = 1,
      calendarId = 12,        // global private
      isPrivateCalendar = true,
      start = 1620228600000L, // "2021-05-05T15:30:00.00Z"
      end = 1620316800000L,   //  "2021-05-06T16:00:00.00Z"
      title = "Event 4",
      description = "private project 1 calendar: userId 3",
      eventType = EventType.Meeting.id,
      repetition = Repetitive.Daily.id,
      allDay = false,
      creator = 3
    ),
    events += Event(
      eventId = 5,
      workspaceId = 1,
      calendarId = 5,         // private project 3
      isPrivateCalendar = true,
      start = 1614940200000L, // "2021-03-05T10:30:00.00Z"
      end = 1614943800000L,   //  "2021-03-05T11:30:00.00Z"
      title = "Event 5",
      description = "private global calendar: userId 1",
      eventType = EventType.Meeting.id,
      repetition = Repetitive.Daily.id,
      allDay = false,
      creator = 1
    ),
    events += Event(
      eventId = 6,
      workspaceId = 1,
      calendarId = 8,         // private project 1
      isPrivateCalendar = true,
      start = 1612776600000L, // "2021-02-08T09:30:00.00Z"
      end = 1612780200000L,   //  "2021-02-08T10:30:00.00Z"
      title = "Event 6",
      description = "private project 1 calendar: userId 1",
      eventType = EventType.Meeting.id,
      repetition = Repetitive.Daily.id,
      allDay = false,
      creator = 1
    ),
    events += Event(
      eventId = 7,
      workspaceId = 1,
      calendarId = 18,        // public project 3
      isPrivateCalendar = false,
      start = 1609666200000L, // "2021-01-03T09:30:00.00Z"
      end = 1609673400000L,   //  "2021-01-03T11:30:00.00Z"
      title = "Event 7",
      description = "public project 3 calendar: userId 4",
      eventType = EventType.Meeting.id,
      repetition = Repetitive.Daily.id,
      allDay = false,
      creator = 4
    )
  )

  lazy val addLeaves = DBIO.seq(
    leaves += Leave(
      workspaceId = 1,
      leaveId = 1,
      start = 1672531200, // "2023-01-01"
      isFullDayStart = true,
      end = 1672617600,   // "2023-01-02"
      isFullDayEnd = true,
      daysNumber = 2,
      userId = 1,
      leaveType = LeaveType.Sick.id,
      description = "Leave 1",
      state = State.Waiting.id,
      comment = "Leave is Waiting."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 2,
      start = 1675209600, // "2023-02-01"
      isFullDayStart = true,
      end = 1675382400,   // "2023-02-03"
      isFullDayEnd = true,
      daysNumber = 3,
      userId = 1,
      leaveType = LeaveType.Sick.id,
      description = "Leave 2",
      state = State.InProgress.id,
      comment = "Leave is InProgress."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 3,
      start = 1646092800, // "2022-03-01"
      isFullDayStart = true,
      end = 1646092800,   // "2022-03-01"
      isFullDayEnd = true,
      daysNumber = 1,
      userId = 1,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 3",
      state = State.Approved.id,
      comment = "Leave is Approved."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 4,
      start = 1648771200, // "2022-04-01"
      isFullDayStart = true,
      end = 1649030400,   // "2022-04-04"
      isFullDayEnd = true,
      daysNumber = 4,
      userId = 1,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 4",
      state = State.Refused.id,
      comment = "Leave is Refused."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 5,
      start = 1651363200, // "2022-05-01"
      isFullDayStart = true,
      end = 1651449600,   // "2022-05-02"
      isFullDayEnd = true,
      daysNumber = 2,
      userId = 1,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 5",
      state = State.Canceled.id,
      comment = "Leave is Canceled."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 6,
      start = 1654041600, // "2022-06-01"
      isFullDayStart = true,
      end = 1654041600,   // "2022-06-01"
      isFullDayEnd = true,
      daysNumber = 1,
      userId = 3,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 6",
      state = State.Waiting.id,
      comment = "Leave is Waiting."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 7,
      start = 1656633600, // "2022-07-01"
      isFullDayStart = true,
      end = 1656979200,   // "2022-07-05"
      isFullDayEnd = true,
      daysNumber = 5,
      userId = 3,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 7",
      state = State.InProgress.id,
      comment = "Leave is InProgress."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 8,
      start = 1659312000, // "2022-08-01"
      isFullDayStart = true,
      end = 1659398400,   // "2022-08-02"
      isFullDayEnd = true,
      daysNumber = 2,
      userId = 3,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 8",
      state = State.Approved.id,
      comment = "Leave is Approved."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 9,
      start = 1661990400, // "2022-09-01"
      isFullDayStart = true,
      end = 1661990400,   // "2022-09-01"
      isFullDayEnd = true,
      daysNumber = 1,
      userId = 3,
      leaveType = LeaveType.Sick.id,
      description = "Leave 9",
      state = State.Refused.id,
      comment = "Leave is Refused."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 10,
      start = 1664582400, // "2022-10-01"
      isFullDayStart = true,
      end = 1664755200,   // "2022-10-03"
      isFullDayEnd = true,
      daysNumber = 3,
      userId = 3,
      leaveType = LeaveType.Sick.id,
      description = "Leave 10",
      state = State.Canceled.id,
      comment = "Leave is Canceled."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 11,
      start = 1667260800, // "2022-11-01"
      isFullDayStart = true,
      end = 1667260800,   // "2022-11-01"
      isFullDayEnd = true,
      daysNumber = 1,
      userId = 4,
      leaveType = LeaveType.Sick.id,
      description = "Leave 11",
      state = State.Waiting.id,
      comment = "Leave is Waiting."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 12,
      start = 1669852800, // "2022-12-01"
      isFullDayStart = true,
      end = 1670112000,   // "2022-12-04"
      isFullDayEnd = true,
      daysNumber = 4,
      userId = 4,
      leaveType = LeaveType.Sick.id,
      description = "Leave 12",
      state = State.InProgress.id,
      comment = "Leave is InProgress."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 13,
      start = 1641772800, // "2022-01-10"
      isFullDayStart = true,
      end = 1642204800,   // "2022-01-15"
      isFullDayEnd = true,
      daysNumber = 5,
      userId = 4,
      leaveType = LeaveType.Sick.id,
      description = "Leave 13",
      state = State.Approved.id,
      comment = "Leave is Approved."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 14,
      start = 1644451200, // "2022-02-10"
      isFullDayStart = true,
      end = 1644451200,   // "2022-02-10"
      isFullDayEnd = true,
      daysNumber = 1,
      userId = 4,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 14",
      state = State.Refused.id,
      comment = "Leave is Refused."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 15,
      start = 1644451200, // "2022-02-10"
      isFullDayStart = true,
      end = 1644451200,   // "2022-02-10"
      isFullDayEnd = true,
      daysNumber = 1,
      userId = 4,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 15",
      state = State.Canceled.id,
      comment = "Leave is Canceled."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 16,
      start = 1646870400, // "2022-03-10"
      isFullDayStart = true,
      end = 1647216000,   // "2022-03-14"
      isFullDayEnd = true,
      daysNumber = 4,
      userId = 5,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 16",
      state = State.Waiting.id,
      comment = "Leave is Waiting."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 17,
      start = 1649548800, // "2022-04-10"
      isFullDayStart = true,
      end = 1649548800,   // "2022-04-10"
      isFullDayEnd = true,
      daysNumber = 1,
      userId = 5,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 17",
      state = State.InProgress.id,
      comment = "Leave is InProgress."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 18,
      start = 1652140800, // "2022-05-10"
      isFullDayStart = true,
      end = 1652745600,   // "2022-05-17"
      isFullDayEnd = true,
      daysNumber = 7,
      userId = 5,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 18",
      state = State.Approved.id,
      comment = "Leave is Approved."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 19,
      start = 1654819200, // "2022-06-10"
      isFullDayStart = true,
      end = 1654905600,   // "2022-06-11"
      isFullDayEnd = true,
      daysNumber = 2,
      userId = 5,
      leaveType = LeaveType.Sick.id,
      description = "Leave 19",
      state = State.Refused.id,
      comment = "Leave is Refused."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 20,
      start = 1657411200, // "2022-07-10"
      isFullDayStart = true,
      end = 1657843200,   // "2022-07-15"
      isFullDayEnd = true,
      daysNumber = 2,
      userId = 5,
      leaveType = LeaveType.Sick.id,
      description = "Leave 20",
      state = State.Canceled.id,
      comment = "Leave is Canceled."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 21,
      start = 1672531200, // "2022-01-01"
      isFullDayStart = true,
      end = 1672617600,   // "2022-01-02"
      isFullDayEnd = true,
      daysNumber = 2,
      userId = 6,
      leaveType = LeaveType.Sick.id,
      description = "Leave 21",
      state = State.Waiting.id,
      comment = "Leave is Waiting."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 22,
      start = 1675209600, // "2023-02-01"
      isFullDayStart = true,
      end = 1675382400,   // "2023-02-03"
      isFullDayEnd = true,
      daysNumber = 3,
      userId = 6,
      leaveType = LeaveType.Sick.id,
      description = "Leave 22",
      state = State.InProgress.id,
      comment = "Leave is InProgress."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 23,
      start = 1646092800, // "2022-03-01"
      isFullDayStart = true,
      end = 1646092800,   // "2022-03-01"
      isFullDayEnd = true,
      daysNumber = 1,
      userId = 6,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 23",
      state = State.Approved.id,
      comment = "Leave is Approved."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 24,
      start = 1648771200, // "2022-04-01"
      isFullDayStart = true,
      end = 1649030400,   // "2022-04-04"
      isFullDayEnd = true,
      daysNumber = 4,
      userId = 6,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 24",
      state = State.Refused.id,
      comment = "Leave is Refused."
    ),
    leaves += Leave(
      workspaceId = 1,
      leaveId = 25,
      start = 1651363200, // "2022-05-01"
      isFullDayStart = true,
      end = 1651449600,   // "2022-05-02"
      isFullDayEnd = true,
      daysNumber = 2,
      userId = 6,
      leaveType = LeaveType.Holiday.id,
      description = "Leave 25",
      state = State.Canceled.id,
      comment = "Leave is Canceled."
    )
  )

  lazy val addSuperAdmins = DBIO.seq(
    superAdmins.result.flatMap { admins =>
      if (admins.isEmpty) {
        superAdmins += SuperAdmin(1, "super-admin", "admin".hashed, active = true)
      } else DBIO.seq()
    }
  )

  lazy val addTasks = DBIO.seq(
    tasks += Task(workspaceId = 1, taskId = 1, name = "Task T1", key = "Open", index = 0),
    tasks += Task(workspaceId = 1, taskId = 2, name = "Task T2", key = "InProgress", index = 1),
    tasks += Task(workspaceId = 1, taskId = 3, name = "Task T3", key = "Review", index = 2)
  )
  lazy val addCards = DBIO.seq(
    cards += Card(
      workspaceId = 1,
      cardId = 1,
      status = Status.Open,
      projectId = 1,
      project = "Project A1",
      cardType = CardType.Bug,
      title = "Card C1",
      assignee = "Med Bechir",
      priority = Priority.Low,
      storyPoints = 1.5,
      tags = "tags",
      summary = "nothing"
    ),
    cards += Card(
      workspaceId = 1,
      cardId = 2,
      projectId = 2,
      status = Status.Review,
      project = "Project B1",
      cardType = CardType.Epic,
      title = "Card C2",
      assignee = "Ghafer",
      priority = Priority.High,
      storyPoints = 5,
      tags = "tags",
      summary = "nothing"
    ),
    cards += Card(
      workspaceId = 1,
      cardId = 3,
      status = Status.InProgress,
      projectId = 3,
      project = "Project C1",
      cardType = CardType.Story,
      title = "Card C3",
      assignee = "Ameni",
      priority = Priority.Medium,
      storyPoints = 3.5,
      tags = "tags",
      summary = "nothing"
    )
  )

  lazy val addDbVersion = DBIO.seq(
    dbVersions += DbVersion(currentDbVersion)
  )
}
