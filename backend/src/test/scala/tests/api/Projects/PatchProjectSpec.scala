package tests.api.Projects

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.projects.{PatchProject, Project}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ProjectCalls

class PatchProjectSpec extends RestCallsSpec with ProjectCalls with Authentication with HttpClient {

  override def is: SpecStructure =
    "Specification to check the patch project rest call".title ^ sequential ^
      s2"""
    The workspace admin can:
       edit a project                                                           $p1

    The workspace admin cannot:
       edit a project with projectId not found                                  $n1
       edit a project with invalid workspace                                    $n2
       edit a project name with name already exists                             $n3

    Any workspace user without the role Administrator cannot:
       edit a project                                                           $n4
      """

  private def p1 =
    patchProject(
      1,
      1,
      PatchProject(None, Some("New Project"), Some("Patch Description"), Some("Note for new project"), Some(false))
    )(using workspaceAdminToken) should beRight { (project: Project) =>
      project.name === "New Project" and
      project.description === "Patch Description" and
      project.note === "Note for new project" and
      project.isActive === false
    }

  private def n1 =
    patchProject(
      1,
      150,
      PatchProject(
        None,
        Some("New Project"),
        Some(""),
        Some(""),
        Some(false)
      )
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n2 =
    patchProject(
      150,
      1,
      PatchProject(
        None,
        Some("New Project"),
        Some(""),
        Some(""),
        Some(false)
      )
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n3 =
    patchProject(
      1,
      1,
      PatchProject(
        None,
        Some("Project C1"),
        Some(""),
        Some(""),
        Some(false)
      )
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict and
      response._2 === Failure("Unable to update the project, there is another project with the same name.")
    }

  private def n4 =
    patchProject(
      1,
      1,
      PatchProject(
        None,
        Some("Project C1"),
        Some(""),
        Some(""),
        Some(false)
      )
    )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
