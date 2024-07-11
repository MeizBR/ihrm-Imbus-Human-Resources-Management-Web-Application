package controllers

import org.apache.pekko.http.scaladsl.marshalling.ToResponseMarshallable
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.complete
import org.apache.pekko.http.scaladsl.server.Route
import api.generated.cards.{PatchCard, PostCard}
import db._
import utils.pekkohttpcirce.FailFastCirceSupport._
import models.Cards
import utils.RestErrorFactory.Failure
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContextExecutor
import io.circe.generic.auto._
import io.circe.syntax._
import utils.pekkohttpcirce._
object CardsHandler {
  private given ec: ExecutionContextExecutor = global

  def failureMessage(statueIntValue: Int, call: String): String =
    if (statueIntValue == 409 && call == "Post") "Unable to create the card."
    else if (statueIntValue == 409 && call == "Patch") "Unable to update the card."
    else if (statueIntValue == 403) "Forbidden or workspace not found."
    else "Not Found."

  def readCards(db: Databases, workspaceId: Int, projectId: Option[Int]): Route = complete(
    Cards.getCards(db, workspaceId, projectId).map[ToResponseMarshallable](_.map(_.toRest).asJson)
  )

  def readItsProjectsCards(db: Databases, workspaceId: Int, userId: Int): Route = complete(
    Cards.getItsProjectsCards(db, workspaceId, userId).map[ToResponseMarshallable](_.map(_.toRest).asJson)
  )

  def createCard(db: Databases, workspaceId: Int, newCard: PostCard): Route = complete(
    Cards.create(db, workspaceId, newCard).map[ToResponseMarshallable] {
      case Right(card)      => StatusCodes.Created -> card.toRest
      case Left(statusCode) => statusCode          -> Failure(failureMessage(statusCode.intValue(), "Post"))
    }
  )

  def patchCard(db: Databases, workspaceId: Int, cardId: Int, patch: PatchCard): Route = complete(
    Cards.patch(db, workspaceId, cardId, patch).map[ToResponseMarshallable] {
      case Right(card)      => StatusCodes.OK -> card.toRest
      case Left(statusCode) => statusCode     -> Failure(failureMessage(statusCode.intValue(), "Patch"))
    }
  )

  def deleteCard(db: Databases, workspaceId: Int, cardId: Int): Route = complete(
    Cards.delete(db, workspaceId, cardId).map[ToResponseMarshallable] {
      case Left(statusCode) => statusCode -> Failure(failureMessage(statusCode.intValue(), "Delete"))
      case _                => StatusCodes.NoContent
    }
  )
}
