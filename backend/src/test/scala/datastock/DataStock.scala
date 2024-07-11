package datastock

import api.generated.customers.{Customer, PostCustomer}
import api.generated.projects.{PostProject, Project}
import api.generated.users.{PostUser, User}
import api.generated.workspaces.{PostWorkspace, Workspace}
import utils._
import HttpClient._
import api.enumeration.GlobalRole
import utils.Calls.{CustomerCalls, ProjectCalls, SessionCalls, UserCalls, WorkspaceCalls}

trait DataStock
    extends SessionCalls
    with WorkspaceCalls
    with UserCalls
    with CustomerCalls
    with ProjectCalls
    with HttpClient {

  def createWorkspaceWithAdmin(workspaceName: String, login: String, roles: GlobalRole*)(using
      token: String
  ): (Workspace, User) = {
    val ws   = postWorkspace(PostWorkspace(name = workspaceName, description = None, isActive = None)).get
    val post = PostUser(
      firstName = "test_firstName",
      lastName = "test_lastName",
      login = login,
      email = s"$login@imbus.tn",
      note = None,
      password = login,
      isActive = Some(true)
    )
    val user = postUserBySuperAdmin(ws.id, post).get
    if (roles.nonEmpty) putUserRolesBySuperAdmin(ws.id, user.id, roles.toList)
    (ws, user)
  }

  def createUser(workspaceId: Int, login: String, roles: GlobalRole*)(using token: String): User = {
    val post = PostUser(
      firstName = "test_firstName",
      lastName = "test_lastName",
      login = login,
      email = s"$login@imbus.tn",
      note = None,
      password = login,
      isActive = Some(true)
    )
    val user = postUser(workspaceId, post).get
    if (roles.nonEmpty) putUserRoles(workspaceId, user.id, roles.toList)
    user
  }

  def createCustomer(workspaceId: Int, name: String)(using toke: String): Customer =
    postCustomer(workspaceId, PostCustomer(name = name, description = None, note = None, isActive = None)).get

  def createProject(workspaceId: Int, customerId: Int, name: String)(using toke: String): Project =
    postProject(
      workspaceId,
      PostProject(customerId = customerId, name = name, description = Some(""), note = Some(""), isActive = Some(true))
    ).get
}
