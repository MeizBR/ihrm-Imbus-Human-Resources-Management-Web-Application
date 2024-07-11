package tests.api.Customers

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.RestErrorFactory.Failure
import utils.{Authentication, HttpClient}
import utils.Calls.CustomerCalls

class DeleteCustomerSpec extends RestCallsSpec with CustomerCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the delete customer rest call".title ^ sequential ^
    s2"""
     The default workspace admin can:
         delete a customer                                                  

    The default workspace admin cannot:
         delete a customer with invalid or wrong id                        
         delete a customer with workspaceId not found                      
         delete a customer if it still has projects                        

    Any workspace user without the role Administrator cannot:
        delete a customer                                                  
      """

  private def p1 = deleteCustomer(3, 1)(using workspaceAdminToken) should beRight

  private def n1 = deleteCustomer(150, 1)(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound and
      response._2 === Failure("Not found.")
  }

  private def n2 = deleteCustomer(1, 150)(using workspaceAdminToken) should beLeft {
    (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden and
      response._2 === Failure("Forbidden or workspace not found.")
  }

  private def n3 = deleteCustomer(1, 1)(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Conflict and
    response._2 === Failure("Customer still has projects.")
  }

  private def n4 = deleteCustomer(1, 3)(using userToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden and
    response._2 === Failure("Forbidden or workspace not found.")
  }
}
