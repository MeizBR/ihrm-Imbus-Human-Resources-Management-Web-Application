package tests.api.Activities

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ActivityCalls
import scala.language.implicitConversions

class DeleteActivitySpec extends RestCallsSpec with ActivityCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the delete activity rest call".title ^ sequential ^
    s2"""
    The workspace admin can:
        delete any activity                                                                             $p1

    The default workspace admin cannot:
        delete an activity with invalid activityId                                                      $n1
        delete an activity with invalid workspaceId                                                     $n2

    The project Lead can:
        delete his activity                                                                             $p2
        delete another user activity in project where he has role                                       $p3

    The project Lead cannot:
        delete another user activity in project where he has not role                                   $n3
        delete an activity with invalid activityId                                                      $n4
        delete an activity with invalid workspaceId                                                     $n5

    Any workspace user can:
        delete his activity                                                                             $p4

    Any workspace user without the role Administrator or Lead cannot:
        delete an activity for another user                                                             $n6
      """
  private def p1                 = deleteActivity(1, 3)(using workspaceAdminToken) should beRight

  private def p2 = deleteActivity(1, 3)(using leadToken) should beLeft.which { case (statusCode, failure) =>
    statusCode mustEqual StatusCodes.Forbidden
    failure.failureType mustEqual "Forbidden or workspace not found."
  }

  private def p3 = deleteActivity(1, 9)(using leadToken) should beRight

  private def p4 = deleteActivity(1, 2)(using userToken) should beRight

  private def n1 = deleteActivity(1, 150)(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Activity not found.")
  }

  private def n2 = deleteActivity(150, 4)(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n3 = deleteActivity(1, 10)(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n4 = deleteActivity(1, 150)(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n5 = deleteActivity(150, 6)(using leadToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n6 = deleteActivity(1, 150)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }
}
