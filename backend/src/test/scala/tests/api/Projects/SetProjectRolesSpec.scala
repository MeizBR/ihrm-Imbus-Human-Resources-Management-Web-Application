package tests.api.Projects

import api.enumeration.ProjectRole
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.matcher.MatchResult
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ProjectCalls
import utils.HttpClient.Result

class SetProjectRolesSpec extends RestCallsSpec with ProjectCalls with Authentication with HttpClient {

  override def is: SpecStructure =
    "Specification to check the set project roles rest call".title ^ sequential ^
      s2"""
      The workspace admin can:
          set user project role                                                           $p1
          set project roles to his self                                                   $p2

      The project Lead can:
          set user project role                                                           $p3
          set project roles to his self                                                   $p4

      The workspace admin cannot:
          set project roles with invalid workspaceId                                     $n1
          set project roles with invalid projectId                                       $n2
          set project roles with invalid userId                                          $n7

      The project Lead cannot:
          remove the Lead role to his self                                                $n3
          set project roles with invalid workspaceId                                      $n4
          set project roles with invalid projectId                                        $n5
          set project roles with invalid userId                                           $n8

      Any workspace user without the role Administrator or Lead cannot:
          set user project role                                                           $n6
      """

  private def p1: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 2, userId = 2, List(ProjectRole.Supervisor, ProjectRole.Member))(using
      workspaceAdminToken
    ) should beRight { (projectRoles: List[ProjectRole]) =>
      projectRoles === List(ProjectRole.Supervisor, ProjectRole.Member)
    }

  private def p2: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 2, userId = 2, List(ProjectRole.Supervisor, ProjectRole.Member))(using
      workspaceAdminToken
    ) should beRight { (projectRoles: List[ProjectRole]) =>
      projectRoles === List(ProjectRole.Supervisor, ProjectRole.Member)
    }

  private def p3: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 1, userId = 4, List(ProjectRole.Supervisor))(using
      leadToken
    ) should beRight { (projectRoles: List[ProjectRole]) =>
      projectRoles === List(ProjectRole.Supervisor)
    }

  private def p4: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(
      workspaceId = 1,
      projectId = 1,
      userId = 3,
      List(ProjectRole.Lead, ProjectRole.Member, ProjectRole.Supervisor)
    )(using leadToken) should beRight { (projectRoles: List[ProjectRole]) =>
      projectRoles === List(ProjectRole.Lead, ProjectRole.Supervisor, ProjectRole.Member)
    }

  private def n1: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 404, projectId = 1, userId = 3, List(ProjectRole.Supervisor))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
  private def n2: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 404, userId = 3, List(ProjectRole.Supervisor))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Project not found.")
    }

  private def n3: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 1, userId = 3, List(ProjectRole.Member, ProjectRole.Supervisor))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Cannot delete lead role.")
    }

  private def n4: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 404, projectId = 1, userId = 3, List(ProjectRole.Supervisor))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n5: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 404, userId = 3, List(ProjectRole.Supervisor))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or project not found.")
    }

  private def n6: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 3, 5, List(ProjectRole.Member))(using userToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n7: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 1, userId = 404, List(ProjectRole.Supervisor))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n8: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 3, userId = 404, List(ProjectRole.Member))(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
