package tests.api.Activities

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.projects.{Activity, PatchActivity}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ActivityCalls
import scala.language.implicitConversions

class PatchActivitySpec extends RestCallsSpec with ActivityCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the patch activity rest call".title ^ sequential ^
    s2"""
    The workspace admin can:
        update his activity                                                                                   $p1
        update another user activity                                                                          $p2

    The default workspace admin cannot:
        update an activity for another user in a project where this user has not a role                       $n1
        update an activity with invalid workspaceId                                                           $n2
        update an activity with invalid projectId                                                             $n3
        update an activity with invalid userId                                                                $n4
        update an activity with invalid activityId                                                            $n5

    The project Lead can:
        update his activity                                                                                   $p3
        update another user activity                                                                          $p4

    The project Lead cannot:
        update an activity for another user in a project where he has not a role                              $n6
        update an activity for another user in a project where this user has not a role                       $n7
        update an activity with invalid workspaceId                                                           $n8
        update an activity with invalid projectId                                                             $n9
        update an activity with invalid userId                                                                $n10
        update an activity with invalid activityId                                                            $n11

    Any workspace user can:
        update an activity in project where he has a project role                                             $p5

    Any workspace user without the role Administrator or Lead cannot:
        update an activity for another user                                                                   $n12
      """

  private def p1 =
    patchActivity(
      1,
      8,
      PatchActivity(None, projectId = Some(2), Some("Admin updated activity in project 2"), None, None)
    )(using
      workspaceAdminToken
    ) should beRight { (activity: Activity) =>
      activity.description === "Admin updated activity in project 2"
    }

  private def p2 =
    patchActivity(
      1,
      6,
      PatchActivity(None, projectId = None, Some("Lead updated activity in project 1 by admin"), None, None)
    )(using
      workspaceAdminToken
    ) should beRight { (activity: Activity) =>
      activity.description === "Lead updated activity in project 1 by admin"
    }

  private def p3 =
    patchActivity(
      1,
      6,
      PatchActivity(None, projectId = None, Some("Lead updated activity in project 1 by lead"), None, None)
    )(using
      leadToken
    ) should beRight { (activity: Activity) =>
      activity.description === "Lead updated activity in project 1 by lead"
    }

  private def p4 =
    patchActivity(
      1,
      9,
      PatchActivity(None, projectId = None, Some("Supervisor updated activity in project 1 by lead"), None, None)
    )(using
      leadToken
    ) should beRight { (activity: Activity) =>
      activity.description === "Supervisor updated activity in project 1 by lead"
    }

  private def p5 =
    patchActivity(
      1,
      2,
      PatchActivity(None, projectId = None, Some("Member updated activity in project 3 by member"), None, None)
    )(using
      userToken
    ) should beRight { (activity: Activity) =>
      activity.description === "Member updated activity in project 3 by member"
    }

  private def n1 =
    patchActivity(1, 2, PatchActivity(userId = Some(5), projectId = Some(2), None, None, None))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2 =
    patchActivity(150, 8, PatchActivity(None, None, None, None, None))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n3 =
    patchActivity(1, 8, PatchActivity(None, projectId = Some(150), None, None, None))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Project not found.")
    }

  private def n4 =
    patchActivity(1, 8, PatchActivity(userId = Some(150), None, None, None, None))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n5 =
    patchActivity(1, 150, PatchActivity(None, None, None, None, None))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Activity not found.")
    }

  private def n6 =
    patchActivity(1, 2, PatchActivity(None, None, None, None, None))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n7 =
    patchActivity(1, 9, PatchActivity(None, projectId = Some(2), None, None, None))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n8 =
    patchActivity(150, 7, PatchActivity(None, None, None, None, None))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n9 =
    patchActivity(1, 7, PatchActivity(None, projectId = Some(150), None, None, None))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or project not found.")
    }

  private def n10 =
    patchActivity(1, 7, PatchActivity(userId = Some(150), None, None, None, None))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n11 =
    patchActivity(1, 150, PatchActivity(None, None, None, None, None))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n12 =
    patchActivity(1, 7, PatchActivity(None, None, None, None, None))(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
