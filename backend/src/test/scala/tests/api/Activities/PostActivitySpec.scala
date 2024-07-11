package tests.api.Activities

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.projects.{Activity, PostActivity}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ActivityCalls
import scala.language.implicitConversions

class PostActivitySpec extends RestCallsSpec with ActivityCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the post activity rest call".title ^ sequential ^
    s2"""
    The workspace admin can:
        create an activity for his self                                                                       $p1
        create an activity for another user in a project where this user has project role                     $p2

    The default workspace admin cannot:
        create an activity for another user in a project where this user has not a role                       $n1
        create an activity with invalid workspaceId                                                           $n2
        create an activity with invalid projectId                                                             $n3
        create an activity with invalid userId                                                                $n4

    The project Lead can:
        create an activity for his self                                                                       $p3
        create an activity for another user in a project where this user has project role                     $p4

    The project Lead cannot:
        create an activity for another user in a project where he has not a role                              $n5
        create an activity for another user in a project where this user has not a role                       $n6
        create an activity with invalid workspaceId                                                           $n7
        create an activity with invalid projectId                                                             $n8
        create an activity with invalid userId                                                                $n9

    Any workspace user can:
        create an activity in project where he has a project role                                             $p5

    Any workspace user without the role Administrator or Lead cannot:
        create an activity for another user                                                                   $n10
      """

  private def p1 =
    postActivity(1, PostActivity(userId = 1, projectId = 3, description = "New admin activity in project 3"))(using
      workspaceAdminToken
    ) should beRight { (activity: Activity) =>
      activity.userId === 1 and activity.projectId === 3 and activity.description === "New admin activity in project 3"
    }

  private def p2 =
    postActivity(1, PostActivity(userId = 3, projectId = 1, description = "New lead activity in project 1 by admin"))(
      using workspaceAdminToken
    ) should beRight { (activity: Activity) =>
      activity.userId === 3 and activity.projectId === 1 and activity.description === "New lead activity in project 1 by admin"
    }

  private def p3 =
    postActivity(1, PostActivity(userId = 3, projectId = 1, description = "New lead activity in project 1 by lead"))(
      using leadToken
    ) should beRight { (activity: Activity) =>
      activity.userId === 3 and activity.projectId === 1 and activity.description === "New lead activity in project 1 by lead"
    }

  private def p4 =
    postActivity(
      1,
      PostActivity(userId = 4, projectId = 1, description = "New supervisor activity in project 1 by lead")
    )(using leadToken) should beRight { (activity: Activity) =>
      activity.userId === 4 and activity.projectId === 1 and activity.description === "New supervisor activity in project 1 by lead"
    }

  private def p5 =
    postActivity(
      1,
      PostActivity(userId = 5, projectId = 3, description = "New member activity in project 3 by member")
    )(using userToken) should beRight { (activity: Activity) =>
      activity.userId === 5 and activity.projectId === 3 and activity.description === "New member activity in project 3 by member"
    }

  private def n1 =
    postActivity(1, PostActivity(userId = 5, projectId = 2, description = "new activity"))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2 =
    postActivity(150, PostActivity(userId = 1, projectId = 2, description = "new activity"))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n3 =
    postActivity(1, PostActivity(userId = 1, projectId = 150, description = "new activity"))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Project not found.")
    }

  private def n4 =
    postActivity(1, PostActivity(userId = 150, projectId = 2, description = "new activity"))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n5 =
    postActivity(1, PostActivity(userId = 4, projectId = 3, description = "new activity"))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n6 =
    postActivity(1, PostActivity(userId = 2, projectId = 1, description = "new activity"))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n7 =
    postActivity(150, PostActivity(userId = 1, projectId = 2, description = "new activity"))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n8 =
    postActivity(1, PostActivity(userId = 1, projectId = 150, description = "new activity"))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or project not found.")
    }

  private def n9 =
    postActivity(1, PostActivity(userId = 150, projectId = 2, description = "new activity"))(using
      leadToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n10 =
    postActivity(1, PostActivity(userId = 3, projectId = 3, description = "new activity"))(using
      userToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
