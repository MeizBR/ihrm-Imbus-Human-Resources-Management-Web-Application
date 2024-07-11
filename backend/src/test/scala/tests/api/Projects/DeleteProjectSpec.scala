package tests.api.Projects

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ProjectCalls

class DeleteProjectSpec extends RestCallsSpec with ProjectCalls with Authentication with HttpClient {

  override def is: SpecStructure =
    "Specification to check the delete project rest call".title ^ sequential ^
      s2"""
    The workspace admin can:
        delete a project                                                  $p1

    The workspace admin cannot:
        delete a project with invalid workspaceId                         $n1
        delete a project with invalid projectId                           $n2

    Any workspace user without the role Administrator cannot:
        delete a project                                                  $n3
      """
  private def p1                 =
    deleteProject(
      1,
      1
    )(using workspaceAdminToken) should beRight

  private def n1 =
    deleteProject(
      150,
      1
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2 =
    deleteProject(
      1,
      150
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n3 =
    deleteProject(
      1,
      150
    )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
