package controllers

import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.customers.{PatchCustomer, PostCustomer}
import db._
import utils.pekkohttpcirce.FailFastCirceSupport._
import models.Customers
import utils.RestErrorFactory.{internalServerError, Failure}
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import io.circe.generic.auto._
import io.circe.syntax._
import utils.pekkohttpcirce._
object CustomersHandler {
  private given ec: ExecutionContextExecutor                         = global
  given customerOrdering: Ordering[api.generated.customers.Customer] = Ordering by {
    (c: api.generated.customers.Customer) =>
      (c.name, c.id)
  }

  def readCustomers(db: Databases, workspaceId: Int): Route = complete(
    Customers.getAll(db, workspaceId).map[ToResponseMarshallable](_.map(_.toRest).sorted.asJson)
  )

  def createCustomer(db: Databases, workspaceId: Int, newCustomer: PostCustomer): Route = complete(
    Customers.create(db, workspaceId, newCustomer).map[ToResponseMarshallable] {
      case Right(customer)  => StatusCodes.Created -> customer.toRest
      case Left(statusCode) => statusCode._1       -> Failure(statusCode._2)
      // case _                => internalServerError
    }
  )

  def patchCustomer(db: Databases, workspaceId: Int, customerId: Int, patch: PatchCustomer): Route = complete(
    Customers.patch(db, workspaceId, customerId, patch).map[ToResponseMarshallable] {
      case Right(customer)  => StatusCodes.OK -> customer.toRest
      case Left(statusCode) => statusCode._1  -> Failure(statusCode._2)
      // case _                => internalServerError
    }
  )

  def deleteCustomer(db: Databases, workspaceId: Int, customerId: Int): Route = complete {
    Customers
      .delete(db, workspaceId, customerId)
      .map[ToResponseMarshallable](response => response._1 -> Failure(response._2))
  }
}
