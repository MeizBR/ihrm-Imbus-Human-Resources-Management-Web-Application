package tests.api.Projects

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.projects.Project
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ProjectCalls

class GetProjectsSpec extends RestCallsSpec with ProjectCalls with Authentication with HttpClient {

  override def is: SpecStructure =
    "Specification to check the get projects rest call".title ^ sequential ^
      s2"""
    The workspace admin can:
       get a list of projects with customerId                                                     $p1
       get a list of projects without customerId                                                  $p2

    The workspace admin cannot:
       get a projects list with an invalid workspaceId                                            $n1
       get a list of projects with customerId not found                                           $n2

    Any workspace user can:
       get a list of projects with customerId                                                     $p3
       get a list of projects without customerId                                                  $p4
       get a list of his own projects                                                             p5

    Any workspace user cannot:
       get a projects list with an invalid workspaceId                                            $n3
       get a list of projects with customerId not found                                           $n4
       get a list of his own projects with invalid workspaceId                                    n5
      """

  private def p1 = getProjects(1, Some(2))(using workspaceAdminToken) should beRight { (projects: List[Project]) =>
    val project1 = projects.head
    val project2 = projects.last
    project1.id === 2 and
    project1.name === "Project B1" and
    project1.customerId === 2 and
    project1.description === "New description" and
    project1.isActive === true and
    project1.note === "note for project B1" and
    project2.id === 3 and
    project2.name === "Project C1" and
    project2.customerId === 2 and
    project2.description === "New description" and
    project2.isActive === true and
    project2.note === "note for project C1"
  }

  private def p2 = getProjects(1, None)(using workspaceAdminToken) should beRight { (projects: List[Project]) =>
    val project1 = projects.head
    val project2 = projects.last
    project1.id === 1 and
    project1.name === "Project A1" and
    project1.customerId === 1 and
    project1.description === "New description" and
    project1.isActive === true and
    project1.note === "note for project A1" and
    project2.id === 3 and
    project2.name === "Project C1" and
    project2.customerId === 2 and
    project2.description === "New description" and
    project2.isActive === true and
    project2.note === "note for project C1"
  }

  private def p3 = getProjects(1, Some(2))(using userToken) should beRight { (projects: List[Project]) =>
    val project1 = projects.head
    val project2 = projects.last
    project1.id === 2 and
    project1.name === "Project B1" and
    project1.customerId === 2 and
    project1.description === "New description" and
    project1.isActive === true and
    project1.note === "note for project B1" and
    project2.id === 3 and
    project2.name === "Project C1" and
    project2.customerId === 2 and
    project2.description === "New description" and
    project2.isActive === true and
    project2.note === "note for project C1"
  }

  private def p4 = getProjects(1, None)(using userToken) should beRight { (projects: List[Project]) =>
    val project1 = projects.head
    val project2 = projects.last
    project1.id === 1 and
    project1.name === "Project A1" and
    project1.customerId === 1 and
    project1.description === "New description" and
    project1.isActive === true and
    project1.note === "note for project A1" and
    project2.id === 3 and
    project2.name === "Project C1" and
    project2.customerId === 2 and
    project2.description === "New description" and
    project2.isActive === true and
    project2.note === "note for project C1"
  }

  // todo: fixe me
  private def p5 = getOwnProjects(1, 5)(using userToken) should beRight { (projects: List[Project]) =>
    val project1 = projects.head
    project1.id === 3 and
    project1.name === "Project C1" and
    project1.customerId === 2 and
    project1.description === "New description" and
    project1.isActive === true and
    project1.note === "note for project C1"
  }

  private def n1 =
    getProjects(150, Some(1))(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2 =
    getProjects(1, Some(150))(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n3 =
    getProjects(150, Some(1))(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n4 =
    getProjects(1, Some(150))(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  // todo: fixe me
  private def n5 = getOwnProjects(150, 5)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }
}
