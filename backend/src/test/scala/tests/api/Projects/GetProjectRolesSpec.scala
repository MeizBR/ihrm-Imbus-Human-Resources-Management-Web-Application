package tests.api.Projects

import api.enumeration.ProjectRole.{Lead, Member, Supervisor}
import api.generated.projects.ProjectRoles
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.ProjectCalls

class GetProjectRolesSpec extends RestCallsSpec with ProjectCalls with Authentication with HttpClient {

  override def is: SpecStructure =
    "Specification to check the get project roles rest call".title ^ sequential ^
      s2"""
      The workspace admin can:
          get a single user's project roles                                               $p1
          get all users project roles                                                     $p2

      The project Lead can:
          get list of his own project roles                                               $p3
          get user's project roles                                                        $p4
          get all users project roles                                                     $p7

      The project Supervisor can:
          get list of his own project roles                                               $p5
          get user's project roles                                                        $p6
          get all users project roles                                                     $p8
      """
  private def p1                 =
    getProjectRoles(1, 1, 3)(using workspaceAdminToken) should beRight { (projectRoles: List[String]) =>
      val projectRole = projectRoles.head
      projectRole === "Lead"
    }

  private def p2 =
    getProjectRolesOfAllUsers(1, 1)(using workspaceAdminToken) should beRight { (projectRoles: List[ProjectRoles]) =>
      projectRoles === List(
        ProjectRoles(userId = 3, roles = List(Lead)),
        ProjectRoles(userId = 4, roles = List(Supervisor)),
        ProjectRoles(userId = 6, roles = List(Member))
      )
    }

  private def p3 =
    getOwnProjectRoles(1, 1)(using leadToken) should beRight { (ownProjectRoles: List[String]) =>
      ownProjectRoles.head === "Lead"
    }

  private def p4 = getProjectRoles(1, 1, 4)(using leadToken) should beRight { (projectRoles: List[String]) =>
    val projectRole = projectRoles.head
    projectRole === "Supervisor"
  }

  private def p5 =
    getOwnProjectRoles(1, 2)(using supervisorToken) should beRight { (ownProjectRoles: List[String]) =>
      ownProjectRoles.head === "Supervisor"
    }

  private def p6 = getProjectRoles(1, 1, 3)(using supervisorToken) should beRight { (projectRoles: List[String]) =>
    val projectRole = projectRoles.head
    projectRole === "Lead"
  }

  private def p7 =
    getProjectRolesOfAllUsers(1, 1)(using leadToken) should beRight { (projectRoles: List[ProjectRoles]) =>
      projectRoles === List(
        ProjectRoles(userId = 3, roles = List(Lead)),
        ProjectRoles(userId = 4, roles = List(Supervisor)),
        ProjectRoles(userId = 6, roles = List(Member))
      )
    }

  private def p8 =
    getProjectRolesOfAllUsers(1, 1)(using supervisorToken) should beRight { (projectRoles: List[ProjectRoles]) =>
      projectRoles === List(
        ProjectRoles(userId = 3, roles = List(Lead)),
        ProjectRoles(userId = 4, roles = List(Supervisor)),
        ProjectRoles(userId = 6, roles = List(Member))
      )
    }
}
