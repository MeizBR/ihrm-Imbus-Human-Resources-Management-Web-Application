package datastock

import api.enumeration.{GlobalRole, ProjectRole}
import api.generated.sessions.PostUserSession
import utils.{Authentication, HttpClient}

object DefaultDataStock extends DataStock with Authentication with App with HttpClient {
  // _: HttpClient =>

  import HttpClient._

  def login(session: PostUserSession): String = loginUser(session).get.token

  List("imbus", "diligate").foreach { wsName =>
    val (ws, user)          = createWorkspaceWithAdmin(wsName, "admin", GlobalRole.Administrator)(using superAdminToken)
    given userToken: String = login(PostUserSession(workspace = ws.name, login = user.login, password = "admin"))
    val acm                 = createUser(ws.id, "manager", GlobalRole.AccountManager)
    val lead                = createUser(ws.id, "lead")
    val supervisor          = createUser(ws.id, "supervisor")
    val member              = createUser(ws.id, "member")
    Range(1, 5).foreach { idx =>
      val customer = createCustomer(ws.id, s"Customer N° $idx")
      List(s"Project A${customer.id}", s"Project B${customer.id}", s"Project C${customer.id}").foreach { projectName =>
        val project = createProject(ws.id, customer.id, projectName)
        setProjectRoles(ws.id, project.id, lead.id, List(ProjectRole.Lead))
        setProjectRoles(ws.id, project.id, supervisor.id, List(ProjectRole.Supervisor))
        setProjectRoles(ws.id, project.id, member.id, List(ProjectRole.Member))
      }
    }
  }
}
