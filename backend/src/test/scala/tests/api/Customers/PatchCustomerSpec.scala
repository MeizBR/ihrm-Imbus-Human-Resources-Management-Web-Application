package tests.api.Customers

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.customers.{Customer, PatchCustomer}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.CustomerCalls

class PatchCustomerSpec extends RestCallsSpec with CustomerCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the patch customer rest call".title ^ sequential ^
    s2"""
     The default workspace admin can:
         edit a customer                                                        $p1

    The default workspace admin cannot:
         edit customer with customerId not found                                $n1
         edit customer with workspaceId not found                               $n2
         edit customer with a name already used                                 $n3

    Any workspace user without the role Administrator cannot:
         edit a customer                                                        $n4
      """
  private def p1                 =
    patchCustomer(1, 1, PatchCustomer(Some("Edited customer"), Some("New Description"), Some(""), Some(true)))(using
      workspaceAdminToken
    ) should
      beRight { (customers: Customer) =>
        customers.name === "Edited customer" and customers.description === "New Description" and customers.note === "" and customers.isActive === true
      }

  private def n1 =
    patchCustomer(
      150,
      1,
      PatchCustomer(Some("Customer"), Some("New Customer after patch"), Some(""), Some(true))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
    }

  private def n2 =
    patchCustomer(
      1,
      150,
      PatchCustomer(Some("Customer"), Some("New Customer after patch"), Some(""), Some(true))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n3 =
    patchCustomer(
      1,
      1,
      PatchCustomer(Some("Customer 2"), Some("New Customer"), Some(""), Some(true))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict and
      response._2 === Failure("Unable to update this customer, there is another customer with the same name.")
    }

  private def n4 =
    patchCustomer(
      1,
      1,
      PatchCustomer(Some("Customer"), Some("New Customer"), Some(""), Some(true))
    )(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
