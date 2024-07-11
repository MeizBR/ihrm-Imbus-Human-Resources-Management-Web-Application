package models

import db.{Customer, Databases, Project, Schema}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.{Conflict, Forbidden, InternalServerError, NoContent, NotFound}
import api.generated.customers.{PatchCustomer, PostCustomer}
import utils.ClassLogging
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import io.circe.generic.auto._
import io.circe.syntax._
object Customers extends Schema with ClassLogging {

  import config.profile.api._

  given ec: ExecutionContextExecutor = global

  def get(db: Databases, workspaceId: Int, customerId: Int): Future[Option[Customer]] =
    db.engine.run(customers.filter(c => c.id === customerId && c.workspaceId === workspaceId).result.headOption)
//      .recover { case e: Throwable =>
//        log.error(s"Failed to read this customer $customerId:\n ${e.getMessage}")
//        None
//      }

  def getAll(db: Databases, workspaceId: Int): Future[Seq[Customer]] =
    db.engine.run(customers.filter(_.workspaceId === workspaceId).result)

  def getProjectsByCustomerId(db: Databases, workspaceId: Int, customerId: Int): Future[Seq[Project]] =
    db.engine.run(
      projects.filter(p => p.customerId === customerId && p.workspaceId === workspaceId && p.isDeleted === false).result
    )

  def create(
      db: Databases,
      workspaceId: Int,
      newCustomer: PostCustomer
  ): Future[(StatusCode, String) Either Customer] =
    db.engine
      .run(customers.filter(c => c.workspaceId === workspaceId && c.name === newCustomer.name).result.headOption)
      .flatMap {
        case Some(_) =>
          Future(Left(Conflict -> "Unable to create a customer, there is another customer with the same name."))
        case _       =>
          val insertQuery = (customers
            .map(c => (c.workspaceId, c.name, c.description, c.note, c.active)) returning customers.map(_.id)) +=
            (workspaceId, newCustomer.name, newCustomer.description
              .getOrElse(""), newCustomer.note.getOrElse(""), newCustomer.isActive.getOrElse(false))

          db.engine.run(insertQuery).flatMap { case id: Int =>
            db.engine.run(customers.filter(_.id === id).result.headOption).map {
              case None                     => Left(NotFound, "Not found.")
              case Some(customer: Customer) => Right(customer)
            }
          }

      }

  def patch(
      db: Databases,
      workspaceId: Int,
      customerId: Int,
      patch: PatchCustomer
  ): Future[(StatusCode, String) Either Customer] =
    db.engine
      .run(customers.filter(c => c.workspaceId === workspaceId && c.id === customerId).result.headOption)
      .flatMap {
        case Some(oldCustomer) =>
          db.engine
            .run(
              customers
                .filter(c => c.workspaceId === workspaceId && c.name === patch.name && c.id =!= customerId)
                .result
                .headOption
            )
            .flatMap {
              case Some(_) =>
                Future(Left(Conflict, "Unable to update this customer, there is another customer with the same name."))
              case _       =>
                update(db, workspaceId, customerId, patch, oldCustomer)
            }
        case None              => Future(Left(NotFound, "Not found."))
      }

  def update(
      db: Databases,
      workspaceId: Int,
      customerId: Int,
      patch: PatchCustomer,
      oldCustomer: Customer
  ): Future[(StatusCode, String) Either Customer] = db.engine
    .run(
      customers
        .filter(_.id === customerId)
        .map(c => (c.name, c.description, c.note, c.active))
        .update(
          patch.name.getOrElse(oldCustomer.name),
          patch.description.getOrElse(oldCustomer.description),
          patch.note.getOrElse(oldCustomer.note),
          patch.isActive.getOrElse(oldCustomer.active)
        )
    )
    .flatMap { _ =>
      get(db, workspaceId, customerId).map {
        case Some(customer: Customer) => Right(customer)
        case _                        => Left(Forbidden, "Forbidden or workspace not found.")
      }
    }

  def delete(db: Databases, workspaceId: Int, customerId: Int): Future[(StatusCode, String)] =
    db.engine
      .run(customers.filter(c => c.workspaceId === workspaceId && c.id === customerId).result.headOption)
      .flatMap {
        case Some(_) =>
          getProjectsByCustomerId(db, workspaceId, customerId).flatMap {
            case Nil =>
              db.engine
                .run(customers.filter(_.id === customerId).delete)
                .map(_ => (NoContent, "Customer was successfully deleted."))
            case _   => Future(Conflict, "Customer still has projects.")
          }
        case None    => Future(NotFound, "Not found.")
      }
}
