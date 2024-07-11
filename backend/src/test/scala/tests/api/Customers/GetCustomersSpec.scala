package tests.api.Customers

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.customers.Customer
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.CustomerCalls

class GetCustomersSpec extends RestCallsSpec with CustomerCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the get customers rest call".title ^ sequential ^
    s2"""
     The default workspace admin can:
         get list of customers                                              $p1

    The default workspace admin cannot:
         get list of customers with workspaceId not found                   $n1

    Any workspace user with any role can:
         get list of customers                                              $p2

    Any workspace user with any role cannot:
         get list of customers with workspaceId not found                   $n2
      """
  private def p1                 =
    getCustomers(1)(using workspaceAdminToken) should beRight { (customers: List[Customer]) =>
      val customer1 = customers.head
      val customer2 = customers.last
      customer1.id === 1 and
      customer1.name === "Customer 1" and
      customer1.description === "" and
      customer1.note === "" and
      customer1.isActive === true and
      customer2.id === 3 and
      customer2.name === "Customer 3" and
      customer2.description === "" and
      customer2.note === "" and
      customer2.isActive === true
    }

  private def p2 =
    getCustomers(1)(using userToken) should beRight { (customers: List[Customer]) =>
      val customer1 = customers.head
      val customer2 = customers.last
      customer1.id === 1 and
      customer1.name === "Customer 1" and
      customer1.description === "" and
      customer1.note === "" and
      customer1.isActive === true and
      customer2.id === 3 and
      customer2.name === "Customer 3" and
      customer2.description === "" and
      customer2.note === "" and
      customer2.isActive === true
    }

  private def n1 =
    getCustomers(150)(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2 =
    getCustomers(150)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
