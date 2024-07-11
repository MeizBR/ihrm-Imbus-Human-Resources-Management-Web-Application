package tests.api.Projects

import api.enumeration.ProjectRole
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.projects.{PatchProject, PostActivity, Project}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.{ActivityCalls, ProjectCalls}
import utils.RestErrorFactory.Failure

class DeleteProjectTraceabilitySpec
    extends RestCallsSpec
    with ProjectCalls
    with ActivityCalls
    with Authentication
    with HttpClient {

  override def is: SpecStructure =
    "Specification to check the delete project rest call".title ^ sequential ^
      s2"""
    The workspace admin can:
        delete a project                                                    $p1

    The workspace admin cannot:
        get a list of a deleted projects                                    $n1
        get user project roles in a deleted project                         $n3
        get all users project roles in a deleted project                    $n4
        set project roles in  a deleted project                             n7
        update a deleted project                                            $n9
        create an activity in a deleted project                             $n10
        get list of activities in a deleted project                         $n12

    Any workspace user cannot:
        get a list of a deleted projects                                    $n2
        get user project roles in a deleted project                         $n5
        get all users project roles in a deleted project                    $n6
        create an activity in a deleted project                             $n11
        get list of activities in a deleted project                         $n13

    The project lead cannot:
        set project roles in a deleted project                              n8
      """

  private def p1 =
    deleteProject(
      1,
      1
    )(using workspaceAdminToken) should beRight

  private def n1 = getProjects(1, Some(1))(using workspaceAdminToken) should beRight { (projects: List[Project]) =>
    projects.isEmpty
  }

  private def n2 = getProjects(1, Some(1))(using userToken) should beRight { (projects: List[Project]) =>
    projects.isEmpty
  }

  private def n3 = getProjectRoles(1, 1, 3)(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Project not found.")
  }

  private def n4 =
    getProjectRolesOfAllUsers(1, 1)(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Project not found.")
    }

  private def n5 = getProjectRoles(1, 1, 3)(using supervisorToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or project not found.")
  }

  private def n6 =
    getProjectRolesOfAllUsers(1, 1)(using supervisorToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or project not found.")
    }

  // todo: to be fixed after merging hejer's branch
  private def n7 =
    setProjectRoles(1, 2, 3, List(ProjectRole.Supervisor, ProjectRole.Member))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  // todo: to be fixed after merging hejer's branch
  private def n8 =
    setProjectRoles(1, 1, 4, List(ProjectRole.Member))(using leadToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n9 =
    patchProject(
      1,
      1,
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

  private def n10 =
    postActivity(1, PostActivity(userId = 1, projectId = 1, description = "new activity"))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Project not found.")
    }

  private def n11 =
    postActivity(1, PostActivity(userId = 1, projectId = 1, description = "new activity"))(using
      supervisorToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or project not found.")
    }

  private def n12 = getActivities(1, userId = None, projectId = Some(1))(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Project not found.")
  }

  private def n13 = getActivities(1, userId = None, projectId = Some(1))(using supervisorToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or project not found.")
  }
}
