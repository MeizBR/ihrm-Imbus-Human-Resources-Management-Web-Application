package tests.api

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.workspaces.{PatchWorkspace, PostWorkspace, Workspace}
import org.specs2.specification.core.SpecStructure
import utils.{Authentication, HttpClient}
import utils.Calls.WorkspaceCalls
import utils.RestErrorFactory.Failure

class WorkspacesSpec extends RestCallsSpec with WorkspaceCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the super admin calls".title ^ sequential ^
    s2"""
     The default super admin can:
       get list of workspaces                                                       $p1
       create a workspace                                                           $p2
       update a workspace                                                           $p3
       delete a workspace                                                           $p4

     The default super admin cannot:
       created with a wrong session token                                           $n0
       create a workspace with the data of another existed workspace                $n1
       update a workspace with invalid workspaceId                                  $n2
       update a workspace with workspace name already exists                        $n3
       delete a workspace with invalid workspaceId                                  $n4
      """

  private var workspaceId: Int = _

  private def p1 =
    getWorkspaces()(using superAdminToken) should beRight { (ws: List[Workspace]) =>
      val ws1 = ws.head
      val ws2 = ws.last
      ws1.isActive === true and ws1.description === "Updated description" and ws1.name === "diligate" and ws1.id === 2
      ws2.isActive === true and ws2.description === "new Description" and ws2.name === "randomWorkspace" and ws2.id === 3
    }

  private def p2 =
    postWorkspace(PostWorkspace("New workspace", Some("New description"), Some(true)))(using
      superAdminToken
    ) should beRight { (ws: Workspace) =>
      workspaceId = ws.id
      ws.description === "New description" and ws.isActive === true
    }

  private def p3 =
    patchWorkspace(workspaceId, PatchWorkspace(Some("New workspace"), Some("Updated description"), Some(false)))(using
      superAdminToken
    ) should beRight { (ws: Workspace) =>
      ws.name === "New workspace" and ws.description === "Updated description" and ws.isActive === false
    }

  private def p4 = deleteWorkspace(workspaceId)(using superAdminToken) should beRight

  private def n0 = postWorkspace(PostWorkspace("New workspace", None, None))(using "wrongToken") should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Unauthorized
  }

  private def n1 = postWorkspace(PostWorkspace("imbus", Some(""), Some(true)))(using superAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
  }

  private def n2 = patchWorkspace(
    150,
    PatchWorkspace(Some("New workspace"), Some("new Description"), Some(false))
  )(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
  }

  private def n3 =
    patchWorkspace(2, PatchWorkspace(Some("imbus"), Some("new Description"), Some(false)))(using
      superAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
    }

  private def n4 = deleteWorkspace(501)(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
  }
}
