package api.enumeration

import api.enumeration.Key.findValues
import enumeratum.*

trait IdentifiableEnumEntry extends EnumEntry {
  def id: Byte
}

abstract class BaseEnum[T <: IdentifiableEnumEntry] extends CirceEnum[T] with Enum[T] {
  // val values: IndexedSeq[T] = findValues
  // val indexedValues = valuesToIndex
  def value(id: Byte): Option[T] = values.find(_.id == id)

  def determineEnumValue(passedValue: Option[String], defaultEnumValue: T): T =
    passedValue.flatMap(value => values.find(_.entryName.equalsIgnoreCase(value))).getOrElse(defaultEnumValue)
}

sealed trait GlobalRole extends IdentifiableEnumEntry
object GlobalRole       extends BaseEnum[GlobalRole] {
  case object Administrator  extends GlobalRole { val id: Byte = 1 }
  case object AccountManager extends GlobalRole { val id: Byte = 2 }

  val values: IndexedSeq[GlobalRole] = findValues
}

sealed trait ProjectRole extends IdentifiableEnumEntry
object ProjectRole       extends BaseEnum[ProjectRole] {
  case object Lead       extends ProjectRole { val id: Byte = 1 }
  case object Supervisor extends ProjectRole { val id: Byte = 2 }
  case object Member     extends ProjectRole { val id: Byte = 3 }

  val values: IndexedSeq[ProjectRole] = findValues
}

sealed trait LeaveType extends IdentifiableEnumEntry
object LeaveType       extends BaseEnum[LeaveType] {
  case object Sick    extends LeaveType { val id: Byte = 1 }
  case object Holiday extends LeaveType { val id: Byte = 2 }

  val values: IndexedSeq[LeaveType] = findValues
}

sealed abstract class State(val id: Byte, val description: String) extends IdentifiableEnumEntry
object State                                                       extends BaseEnum[State]    {
  case object Approved   extends State(1, "Approved")
  case object Refused    extends State(2, "Refused")
  case object Canceled   extends State(3, "Canceled")
  case object Waiting    extends State(4, "Waiting")
  case object InProgress extends State(5, "InProgress")

  val values: IndexedSeq[State] = findValues
}
sealed trait CardType                                              extends IdentifiableEnumEntry
object CardType                                                    extends BaseEnum[CardType] {
  case object Story       extends CardType { val id: Byte = 1 }
  case object Epic        extends CardType { val id: Byte = 2 }
  case object Bug         extends CardType { val id: Byte = 3 }
  case object Improvement extends CardType { val id: Byte = 4 }
  case object Others      extends CardType { val id: Byte = 5 }

  val values: IndexedSeq[CardType] = findValues
}

sealed trait Status     extends IdentifiableEnumEntry
object Status           extends BaseEnum[Status]     {
  case object Open       extends Status { val id: Byte = 1 }
  case object InProgress extends Status { val id: Byte = 2 }
  case object Review     extends Status { val id: Byte = 3 }
  case object Close      extends Status { val id: Byte = 4 }

  val values: IndexedSeq[Status] = findValues
}
sealed trait EventType  extends IdentifiableEnumEntry
object EventType        extends BaseEnum[EventType]  {
  case object Meeting  extends EventType { val id: Byte = 1 }
  case object Workshop extends EventType { val id: Byte = 2 }
  case object Training extends EventType { val id: Byte = 3 }
  case object Leave    extends EventType { val id: Byte = 4 }

  val values: IndexedSeq[EventType] = findValues
}
sealed trait Repetitive extends IdentifiableEnumEntry
object Repetitive       extends BaseEnum[Repetitive] {
  case object Daily        extends Repetitive { val id: Byte = 1 }
  case object Weekly       extends Repetitive { val id: Byte = 2 }
  case object Monthly      extends Repetitive { val id: Byte = 3 }
  case object Yearly       extends Repetitive { val id: Byte = 4 }
  case object Unrepeatable extends Repetitive { val id: Byte = 5 }

  val values: IndexedSeq[Repetitive] = findValues
}

sealed trait NotificationType extends IdentifiableEnumEntry
object NotificationType       extends BaseEnum[NotificationType] {
  case object Leave    extends NotificationType { val id: Byte = 1 }
  case object Activity extends NotificationType { val id: Byte = 2 }
  case object Project  extends NotificationType { val id: Byte = 3 }
  val values: IndexedSeq[NotificationType] = findValues
}

sealed trait Priority extends IdentifiableEnumEntry
object Priority       extends BaseEnum[Priority] {
  case object Low      extends Priority { val id: Byte = 1 }
  case object Medium   extends Priority { val id: Byte = 2 }
  case object High     extends Priority { val id: Byte = 3 }
  case object Critical extends Priority { val id: Byte = 4 }

  val values: IndexedSeq[Priority] = findValues

}

sealed trait Key extends IdentifiableEnumEntry
object Key       extends BaseEnum[Key] {
  case object Open       extends Key { val id: Byte = 1 }
  case object InProgress extends Key { val id: Byte = 2 }
  case object Review     extends Key { val id: Byte = 3 }
  case object Close      extends Key { val id: Byte = 4 }
  case object Others     extends Key { val id: Byte = 5 }

  val values: IndexedSeq[Key] = findValues
}
