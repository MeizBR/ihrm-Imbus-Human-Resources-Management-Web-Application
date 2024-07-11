package db

import api.enumeration.{CardType, EventType, LeaveType, Priority, Repetitive, State, Status}
import api.enumeration._
import utils.DefaultValues._
import slick.jdbc.JdbcType
import slick.jdbc.PostgresProfile.api._
trait ColumnTypes extends DbConfiguration {
  import config.profile.api._
  import MappedColumnType.base

  object ColumnTypes {

    private type C[A] = BaseColumnType[A]

    implicit val cardTypeColumnType: C[CardType]                 =
      base[CardType, Byte](_.id, id => CardType.value(id).getOrElse(defaultCardType))
    implicit val statusColumnType: C[Status]                     =
      base[Status, Byte](_.id, id => Status.value(id).getOrElse(defaultStatus))
    implicit val priorityColumnType: C[Priority]                 =
      base[Priority, Byte](_.id, id => Priority.value(id).getOrElse(defaultPriority))
    implicit val leaveTypeColumnType: C[LeaveType]               =
      base[LeaveType, Byte](_.id, id => LeaveType.value(id).getOrElse(defaultLeaveType))
    implicit val leaveStateColumnType: C[State]                  =
      base[State, Byte](_.id, id => State.value(id).getOrElse(defaultLeaveState))
    implicit val eventTypeColumnType: C[EventType]               =
      base[EventType, Byte](_.id, id => EventType.value(id).getOrElse(defaultEventType))
    implicit val repetitiveColumnType: C[Repetitive]             =
      base[Repetitive, Byte](_.id, id => Repetitive.value(id).getOrElse(defaultRepetition))
    implicit val notificationTypeColumnType: C[NotificationType] =
      base[NotificationType, Byte](_.id, id => NotificationType.value(id).getOrElse(defaultNotificationType))

  }
}
