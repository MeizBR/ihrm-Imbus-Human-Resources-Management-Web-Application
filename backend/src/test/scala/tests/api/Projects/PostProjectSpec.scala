package tests.api.Projects

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.projects.{PostProject, Project}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ProjectCalls

class PostProjectSpec extends RestCallsSpec with ProjectCalls with Authentication with HttpClient {

  override def is: SpecStructure =
    "Specification to check the post project rest call".title ^ sequential ^
      s2"""
    The workspace admin can:
       create a project                                                       $p1

    The workspace admin cannot:
       create a project with the same name of an existing project             $n2
       create a project with invalid workspaceId                              $n3
       create a project with customerId not found                             $n4

    Any workspace user without the role Administrator cannot:
       create a project                                                       $n5
      """

  private def p1 =
    postProject(
      1,
      PostProject(1, "New Project", Some("New Project Description"), Some("Note for new project"), Some(true))
    )(using workspaceAdminToken) should beRight { (project: Project) =>
      project.customerId === 1 and
      project.name === "New Project" and
      project.description === "New Project Description" and
      project.note === "Note for new project" and
      project.isActive === true
    }

  private def n2 =
    postProject(1, PostProject(1, "Project A1", Some(""), Some("Note for new project"), None))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict and
      response._2 === Failure("Unable to create a project, there is another project with the same name.")
    }

  private def n3 =
    postProject(150, PostProject(1, "Project B1", Some(""), Some("Note for new project"), Some(true)))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n4 =
    postProject(
      1,
      PostProject(150, "Project B11", Some(""), Some("Note for new project"), Some(true))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n5 =
    postProject(
      1,
      PostProject(1, "Project B11", Some(""), Some("Note for new project"), Some(true))
    )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
