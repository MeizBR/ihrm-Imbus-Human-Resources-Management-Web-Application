/** DefaultValues of iHRM
  *
  * This object contains default values of case class parameters of iHRM project. Use Case: This values are used when an
  * optional parameter of the body of an API is empty, so the default value is used in order to insert it in the db.
  */
package utils
import api.enumeration.{CardType, EventType, LeaveType, Priority, Repetitive, State, Status}
import api.enumeration._

import java.time.ZoneId

object DefaultValues {
  val defaultCardType: CardType                 = CardType.Story
  val defaultStatus: Status                     = Status.Open
  val defaultPriority: Priority                 = Priority.Low
  val defaultLeaveType: LeaveType               = LeaveType.Sick
  val defaultLeaveState: State                  = State.Waiting
  val defaultAllDayLeave: Boolean               = false
  val defaultCalendarId: Int                    = 1
  val defaultTimeZone: String                   = ZoneId.systemDefault.toString
  val defaultDescription: String                = ""
  val defaultEventType: EventType               = EventType.Meeting
  val defaultRepetition: Repetitive             = Repetitive.Unrepeatable
  val defaultNotificationType: NotificationType = NotificationType.Leave
  val defaultAllDayEvent: Boolean               = true
  val defaultStoryPoints: Double                = 0.5
  val defaultCardTag: String                    = ""
}
