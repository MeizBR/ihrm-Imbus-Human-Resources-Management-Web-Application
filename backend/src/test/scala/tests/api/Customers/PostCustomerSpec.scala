package tests.api.Customers

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.customers.{Customer, PostCustomer}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.CustomerCalls

class PostCustomerSpec extends RestCallsSpec with CustomerCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the post customer rest call".title ^ sequential ^
    s2"""
     The default workspace admin can:
         create a customer                                                        $p1

    The default workspace admin cannot:
         create a customer with the same data of another existing customer        $n1
         create customer with workspaceId not found                               $n2

    Any workspace user without the role Administrator cannot:
         create a customer                                                        $n3
      """

  private def p1 =
    postCustomer(1, PostCustomer("New Customer", Some("New Customer"), Some(""), Some(true)))(using
      workspaceAdminToken
    ) should beRight { (customer: Customer) =>
      customer.name === "New Customer" and customer.description === "New Customer" and customer.note === "" and customer.isActive === true
    }

  private def n1 =
    postCustomer(1, PostCustomer("Customer 1", Some(""), Some(""), Some(true)))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict and
      response._2 === Failure("Unable to create a customer, there is another customer with the same name.")
    }

  private def n2 =
    postCustomer(150, PostCustomer("Customer 1", Some(""), Some(""), Some(true)))(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n3 =
    postCustomer(1, PostCustomer("Customer 10", Some(""), Some(""), Some(true)))(using userToken) should beLeft {
      (response: (StatusCode, Failure)) =>
        response._1 === StatusCodes.Forbidden and
        response._2 === Failure("Forbidden or workspace not found.")
    }
}
