//package tests.messaging
//
//import api.generated.sessions.{PostUserSession, UserSession}
//import api.generated.users.{PostUser, UserCreatedMessage}
//import db.Databases
//import org.specs2.specification.core.SpecStructure
//import utils.HttpClient._
//
//import tests.api.RestCallsSpec
//import utils.{WorkspaceCalls, _}
//
//object WebSocketSpec extends MessagingSpec with RestCallsSpec with WorkspaceCalls {
//  override def is: SpecStructure = "Specification to check the messaging".title ^ sequential ^
//    s2"""
//        Subscribe to the channel: workspaces/{workspaceId}/users and receives messages:
//          UserCreatedMessage    ${e1.pendingUntilFixed}
//      """
//
//  override def bus: MessagingBus = busForMsg
//  override def httpClient        = httpClientForMsg
//
//  override protected def resetDataBase: Boolean           = true
//  override protected def prepareData(db: Databases): Unit = {}
//
//  private lazy val userSession: UserSession = loginUser(PostUserSession("imbus", "admin", "admin")).get
//
//  override def token: String = "jhhjhjhj" //fixme: should have a generated token
//  override def workspaceId   = 5          //fixme: the id should be of created workspace
//
//  def e1 = {
//    val existingContent = List.empty[UserCreatedMessage]
//    listeningTo(s"workspaces/${36}/users", existingContent) { channelName =>
//      postUser(workspaceId,
//               PostUser("test_firstName",
//                        "test_lastName",
//                        "user01",
//                        "user01@gmail.com",
//                        "user01",
//                        Some("firstNote"),
//                        Some(true)))(
//        token
//      )
//
//      val msg = UserCreatedMessage(
//        id = 1,
//        firstName = "test_firstName",
//        lastName = "test_lastName",
//        login = "user01",
//        email = "user01",
//        note = "firstNote",
//        isActive = true
//      )
//
//      expectMessage(channelName, "UserCreated", msg)
//    }
//  }
//}
