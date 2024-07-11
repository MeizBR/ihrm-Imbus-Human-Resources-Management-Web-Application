package tests.api.Activities

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.projects.Activity
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.ActivityCalls

import java.time.Instant

class GetActivitiesSpec extends RestCallsSpec with ActivityCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the get activities rest call".title ^ sequential ^
    s2"""
    The workspace admin can:
        get his activities                                                      $p1
        get user activities                                                     $p2
        get all activities                                                      $p3

    The workspace admin cannot:
        get his activities with invalid workspaceId                             $n1
        get user activities with invalid workspaceId                            $n2
        get user activities with invalid userId                                 n3
        get all activities with invalid workspaceId                             $n4
        get all activities with invalid userId                                  n5
        get all activities with invalid projectId                               $n6

    Any workspace user can:
        get his activities                                                      $p4
        get user activities                                                     $p5
        get all activities                                                      $p6

    Any workspace user cannot:
        get his activities with invalid workspaceId                             $n7
        get user activities with invalid workspaceId                            $n8
        get user activities with invalid userId                                 n9
        get all activities with invalid workspaceId                             $n10
        get all activities with invalid userId                                  n11
        get all activities with invalid projectId                               $n12
      """

  private def p1 = getSelfActivities(1)(using workspaceAdminToken) should beRight { (activities: List[Activity]) =>
    val activity1 = activities.head
    activity1.id === 8 and
    activity1.userId === 1 and
    activity1.projectId === 3 and
    activity1.description === "Admin activity in project 3" and
    activity1.start === Instant.ofEpochMilli(1581333120299L) and
    activity1.end === Some(
      Instant.ofEpochMilli(1581336060299L)
    )
  }

  private def p2 = getActivities(1, userId = Some(3))(using workspaceAdminToken) should beRight {
    (activities: List[Activity]) =>
      val activity1 = activities.head
      val activity2 = activities.last
      activity1.id === 4 and
      activity1.userId === 3 and activity1.projectId === 1 and activity1.description === "Lead activity in project 1" and
      activity1.start === Instant.ofEpochMilli(1622793600299L) and
      activity1.end === Some(
        Instant.ofEpochMilli(1622793611299L)
      ) and
      activity2.id === 3 and
      activity2.userId === 3 and activity2.projectId === 1 and activity2.description === "Lead activity in project 1" and
      activity2.start === Instant.ofEpochMilli(0) and activity2.end === Some(
        Instant.ofEpochMilli(0)
      )
  }

  private def p3 = getActivities(1, userId = None, projectId = Some(1))(using workspaceAdminToken) should beRight {
    (activities: List[Activity]) =>
      val activity1 = activities.head
      val activity2 = activities.last
      activity1.id === 4 and
      activity1.userId === 3 and activity1.projectId === 1 and activity1.description === "Lead activity in project 1" and
      activity1.start === Instant.ofEpochMilli(1622793600299L) and
      activity1.end === Some(
        Instant.ofEpochMilli(1622793611299L)
      ) and
      activity2.id === 3 and
      activity2.userId === 3 and activity2.projectId === 1 and activity2.description === "Lead activity in project 1" and
      activity2.start === Instant.ofEpochMilli(0) and activity2.end === Some(
        Instant.ofEpochMilli(0)
      )
  }

  private def p4 = getSelfActivities(1)(using userToken) should beRight { (activities: List[Activity]) =>
    val activity1 = activities.head
    activity1.userId === 5 and activity1.projectId === 3 and activity1.description === "Member activity in project 3" and
    activity1.start === Instant.parse("1970-01-01T00:00:00Z") and activity1.end === Some(
      Instant.parse("1970-01-01T00:00:00Z")
    )
  }

  private def p5 = getActivities(1, userId = Some(4))(using leadToken) should beRight { (activities: List[Activity]) =>
    val activity1 = activities.head
    activity1.id === 9 and
    activity1.userId === 4 and
    activity1.projectId === 1 and
    activity1.description === "Supervisor activity in project 1" and
    activity1.start === Instant.ofEpochMilli(1581333120299L) and
    activity1.end === Some(
      Instant.ofEpochMilli(1581336060299L)
    )
  }

  private def p6 = getActivities(1, userId = None, projectId = Some(1))(using leadToken) should beRight {
    (activities: List[Activity]) =>
      val activity1 = activities.head
      val activity2 = activities.last
      activity1.id === 4 and
      activity1.userId === 3 and activity1.projectId === 1 and activity1.description === "Lead activity in project 1" and
      activity1.start === Instant.ofEpochMilli(1622793600299L) and
      activity1.end === Some(
        Instant.ofEpochMilli(1622793611299L)
      ) and
      activity2.id === 3 and
      activity2.userId === 3 and activity2.projectId === 1 and activity2.description === "Lead activity in project 1" and
      activity2.start === Instant.ofEpochMilli(0) and activity2.end === Some(
        Instant.ofEpochMilli(0)
      )
  }

  private def n1 = getSelfActivities(150)(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n2 = getActivities(150, userId = Some(3))(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  // todo: fixe me ( it returns empty query )
  private def n3 = getActivities(1, userId = Some(150))(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
  }

  private def n4 = getActivities(150, userId = None, projectId = Some(1))(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  // todo: fixe me ( it returns empty query )
  private def n5 = getActivities(1, userId = Some(150), projectId = Some(1))(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
  }

  private def n6 = getActivities(1, userId = None, projectId = Some(150))(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Project not found.")
  }

  private def n7 = getSelfActivities(150)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n8 = getActivities(150, userId = Some(3))(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  // todo: fixe me ( it returns empty query )
  private def n9 = getActivities(1, userId = Some(150))(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n10 = getActivities(150, userId = None, projectId = Some(1))(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  // todo: fixe me ( it returns empty query )
  private def n11 = getActivities(1, userId = Some(150), projectId = Some(1))(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n12 = getActivities(1, userId = None, projectId = Some(150))(using userToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or project not found.")
  }
}
