package tests.api.Events

import org.apache.pekko.http.scaladsl.model.StatusCode
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.specs2.matcher.MatchResult
import utils.Calls.EventCalls
import utils.HttpClient.Result
import utils.RestErrorFactory.Failure

class DeleteEventSpec extends RestCallsSpec with EventCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the Delete event rest call".title ^ sequential ^
    s2"""
        The workspace admin can:
            delete another user's event with a public calendar                                          $p0
        The event creator can:
            delete his event                                                                            $p1

        The workspace admin cannot:
            delete another user's event with a private calendar                                         $n0

        Any workspace user cannot:
            delete an event with invalid workspaceId                                                    $n1
            delete an event with invalid eventId                                                        $n2
            delete another user's event                                                                 $n3
    """

  private def p0: MatchResult[Result[String]] =
    deleteEvent(workspaceId = 1, eventId = 2)(using workspaceAdminToken) should beRight

  private def p1: MatchResult[Result[String]] =
    deleteEvent(workspaceId = 1, eventId = 1)(using workspaceAdminToken) should beRight

  private def n0: MatchResult[Result[String]] =
    deleteEvent(workspaceId = 1, eventId = 4)(using workspaceAdminToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n1: MatchResult[Result[String]] =
    deleteEvent(workspaceId = 404, eventId = 5)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2: MatchResult[Result[String]] =
    deleteEvent(workspaceId = 1, eventId = 404)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n3: MatchResult[Result[String]] =
    deleteEvent(workspaceId = 1, eventId = 4)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
