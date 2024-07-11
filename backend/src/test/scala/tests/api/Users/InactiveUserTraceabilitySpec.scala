package tests.api.Users

import api.enumeration.{GlobalRole, ProjectRole}
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.leaves.{Leave, PostLeave}
import api.generated.projects.{Activity, PatchActivity, PostActivity, Project}
import api.generated.sessions.{PostUserSession, UserSession}
import api.generated.users.{PatchUser, User}
import org.specs2.matcher.MatchResult
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.{ActivityCalls, LeaveCalls, ProjectCalls, UserCalls}
import utils.HttpClient.Result
import utils.RestErrorFactory.Failure

import java.time.LocalDate
import java.time.format.DateTimeFormatter

class InactiveUserTraceabilitySpec
    extends RestCallsSpec
    with HttpClient
    with UserCalls
    with ActivityCalls
    with LeaveCalls
    with ProjectCalls
    with Authentication {

  override def is: SpecStructure = "Specification to check the post user rest calls".title ^ sequential ^
    s2"""
     Any workspace user can:
        connect to the application                                                                       $p0
        use allowed rest calls                                                                           $p01

     The default workspace admin can:
        make any workspace user inactive                                                                 $p1
        get project roles of an inactive user                                                            $p2
        get global roles of an inactive user                                                             $p3

     The project lead can:
        get project roles of an inactive user                                                            $p4
        get global roles of an inactive user                                                             $p5

     The default workspace admin cannot:
        set global roles for an inactive user                                                            $n1
        create an activity for an inactive user                                                          $n2
        create a leave for an inactive user                                                              $n3
        affect an activity to an inactive user                                                           $n4
        set project roles for an inactive user                                                           $n5

     The project lead cannot:
        create an activity for an inactive user                                                          $n6
        affect an activity to an inactive user                                                           $n7
        set project roles for an inactive user                                                           $n8

     Any inactive user cannot:
        connect to the application                                                                       $n9
        use any allowed rest call                                                                        $n10
      """

  private def p0: MatchResult[Result[UserSession]] =
    loginUser(PostUserSession("imbus", "member.login", "member")) should beRight

  private def p01: MatchResult[Result[List[String]]] =
    getUserRoles(workspaceId = 1, userId = 1)(using otherUserToken) should beRight { (roles: List[String]) =>
      lazy val firstRole = roles.head
      firstRole === "Administrator"
    }

  private def p1: MatchResult[Result[User]] =
    patchUser(
      workspaceId = 1,
      userId = Some(6),
      patch = PatchUser(
        None,
        None,
        None,
        None,
        None,
        None,
        Some(false)
      )
    )(using workspaceAdminToken) should beRight { (user: User) =>
      user.isActive === false
    }

  private def n1: MatchResult[Result[List[GlobalRole]]] =
    putUserRoles(workspaceId = 1, userId = 6, roles = List(GlobalRole.Administrator, GlobalRole.AccountManager))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and response._2 === Failure(
        "You cannot set global roles to an inactive user."
      )
    }

  private def n2: MatchResult[Result[Activity]] =
    postActivity(workspaceId = 1, activity = PostActivity(6, 1, "new activity"))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and response._2 === Failure(
        "You cannot create an activity for an inactive user."
      )
    }

  private def n3: MatchResult[Result[Leave]] =
    postLeave(
      workspaceId = 1,
      userId = Some(6),
      leave = PostLeave(
        LocalDate.parse("2021-09-15", formatter),
        isFullDayStart = true,
        LocalDate.parse("2021-09-17", formatter),
        isFullDayEnd = true,
        2,
        "Sick",
        "New description",
        Some("Waiting")
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and response._2 === Failure(
        "You cannot create a leave for an inactive user."
      )
    }

  private def n4: MatchResult[Result[Activity]] =
    patchActivity(workspaceId = 1, activityId = 4, patch = PatchActivity(Some(6), Some(1), None, None, None))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and response._2 === Failure(
        "You cannot affect an activity to an inactive user."
      )
    }

  private def n5: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(workspaceId = 1, projectId = 1, userId = 6, List(ProjectRole.Supervisor))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and response._2 === Failure(
        "You cannot set project roles to an inactive user."
      )
    }

  private def n6: MatchResult[Result[Activity]] =
    postActivity(workspaceId = 1, activity = PostActivity(6, 1, "new activity"))(using leadToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and response._2 === Failure(
          "You cannot create an activity for an inactive user."
        )
    }

  private def n7: MatchResult[Result[Activity]] =
    patchActivity(workspaceId = 1, activityId = 4, patch = PatchActivity(Some(6), None, None, None, None))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and response._2 === Failure(
        "You cannot affect an activity to an inactive user."
      )
    }

  private def n8: MatchResult[Result[List[ProjectRole]]] =
    setProjectRoles(1, 1, 6, List(ProjectRole.Supervisor))(using leadToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and response._2 === Failure(
          "You cannot set project roles to an inactive user."
        )
    }

  private def n9: MatchResult[Result[UserSession]] =
    loginUser(PostUserSession("imbus", "member.login", "member")) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Unauthorized and response._2 === Failure("Login failed. This user is inactive.")
    }

  private def n10: MatchResult[Result[List[Project]]] =
    getProjects(workspaceId = 1, customerId = Some(1))(using otherUserToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and response._2 === Failure("Forbidden or workspace not found.")
    }

  private def p2: MatchResult[Result[List[String]]] =
    getProjectRoles(workspaceId = 1, projectId = 1, userId = 6)(using workspaceAdminToken) should beRight {
      (projectRoles: List[String]) =>
        val projectRole = projectRoles.head
        projectRole === "Member"
    }

  private def p3: MatchResult[Result[List[String]]] =
    getUserRoles(workspaceId = 1, userId = 6)(using workspaceAdminToken) should beRight { (roles: List[String]) =>
      lazy val firstRole = roles.head
      firstRole === "AccountManager"
    }

  private def p4: MatchResult[Result[List[String]]] =
    getProjectRoles(workspaceId = 1, projectId = 1, userId = 6)(using leadToken) should beRight {
      (projectRoles: List[String]) =>
        lazy val projectRole = projectRoles.head
        projectRole === "Member"
    }

  private def p5: MatchResult[Result[List[String]]] =
    getUserRoles(workspaceId = 1, userId = 6)(using leadToken) should beRight { (roles: List[String]) =>
      lazy val firstRole = roles.head
      firstRole === "AccountManager"
    }
}
