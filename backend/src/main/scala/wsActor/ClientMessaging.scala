package wsActor

import api.generated.users.UserCreatedMessage
import db.{Databases, Notification}
import models.Notifications
import utils.MessagingBus
import wsActor.WsActor.Update

object ClientMessaging {
  private def userChannels(workSpaceId: Int): String =
    s"workspaces/$workSpaceId/users"

  def broadcastUserCreated(workSpaceId: Int, bus: MessagingBus, userCreatedMessage: UserCreatedMessage): Unit =
    bus.publish((userChannels(workSpaceId), Update("UserCreated", userCreatedMessage)))

}
