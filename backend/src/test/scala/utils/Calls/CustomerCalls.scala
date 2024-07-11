package utils.Calls

import org.apache.pekko.http.scaladsl.model.HttpMethods
import api.generated.customers.{Customer, PatchCustomer, PostCustomer}
import utils.HttpClient

trait CustomerCalls {
  self: HttpClient =>

  import HttpClient._

  private val route: String = "http://localhost:9000"

  private def customersRoute(workspaceId: Int) = s"$route/api/workspaces/$workspaceId/customers"

  private def customerRoute(customerId: Int, workspaceId: Int) = s"${customersRoute(workspaceId)}/$customerId"

  def postCustomer(workspaceId: Int, customer: PostCustomer)(using token: String): Result[Customer] =
    response(HttpMethods.POST, customersRoute(workspaceId), customer, Option(token)).decoded[Customer]

  def getCustomers(workspaceId: Int)(using token: String): Result[List[Customer]] =
    response(HttpMethods.GET, customersRoute(workspaceId), Option(token)).decoded[List[Customer]]

  def patchCustomer(customerId: Int, workspaceId: Int, patch: PatchCustomer)(using token: String): Result[Customer] =
    response(HttpMethods.PATCH, customerRoute(customerId, workspaceId), patch, Option(token)).decoded[Customer]

  def deleteCustomer(customerId: Int, workspaceId: Int)(using token: String): Result[String] =
    response(HttpMethods.DELETE, customerRoute(customerId, workspaceId), Option(token)).raw
}
