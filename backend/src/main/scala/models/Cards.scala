package models

import api.enumeration.{CardType, Priority, Status}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes.{Conflict, NotFound}
import api.generated.cards.{PatchCard, PostCard}
import db.{Card, Databases, DbConfiguration, Schema}
import utils.DefaultValues._
import utils._
import scala.concurrent.ExecutionContext.global
import scala.concurrent.{ExecutionContextExecutor, Future}

object Cards extends Schema {
  import config.profile.api._
  import ColumnTypes._

  given ec: ExecutionContextExecutor = global

  def find(db: Databases, workspaceId: Int, title: String): Future[Option[Card]] =
    db.engine.run(cards.filter(c => c.workspaceId === workspaceId && c.title === title).result.headOption)

  def get(db: Databases, workspaceId: Int, cardId: Int): Future[Option[Card]] =
    db.engine.run(cards.filter(c => c.id === cardId && c.workspaceId === workspaceId).result.headOption)

  def getCards(db: Databases, workspaceId: Int, projectId: Option[Int]): Future[Seq[Card]] =
    projectId.fold(db.engine.run(cards.filter(_.workspaceId === workspaceId).result)) { projectId =>
      db.engine.run(cards.filter(c => c.workspaceId === workspaceId && c.projectId === projectId).result)
    }

  def getItsProjectsCards(db: Databases, workspaceId: Int, userId: Int): Future[Seq[Card]] = {
    val userProjectsFuture = ProjectUsers.getUserProjects(db, workspaceId, userId)
    for {
      userProjects <- userProjectsFuture
      projectCards <- getProjectsCards(db, workspaceId, userProjects.map(_.projectId))
    } yield projectCards
  }

  private def getProjectsCards(db: Databases, workspaceId: Int, projectIds: Seq[Int]) =
    db.engine.run(
      cards.filter(c => (c.workspaceId === workspaceId) && (c.projectId inSet projectIds)).result
    )

  def create(db: Databases, workspaceId: Int, newCard: PostCard): Future[StatusCode Either Card] =
    db.engine
      .run(cards.filter(c => c.workspaceId === workspaceId && c.title === newCard.title).result.headOption)
      .flatMap {
        case Some(_) => Future(Left(Conflict))
        case _       =>
          val cardType    = CardType.determineEnumValue(Some(newCard.cardType), defaultCardType)
          val status      = Status.determineEnumValue(Some(newCard.status), defaultStatus)
          val priority    = Priority.determineEnumValue(Some(newCard.priority), defaultPriority)
          val insertQuery = (cards.map(c =>
            (
              c.workspaceId,
              c.status,
              c.projectId,
              c.project,
              c.cardType,
              c.title,
              c.assignee,
              c.priority,
              c.storyPoints,
              c.tags,
              c.summary
            )
          ) returning cards.map(_.id)) +=
            (workspaceId, status, newCard.projectId, newCard.project, cardType, newCard.title, newCard.assignee,
            priority, newCard.storyPoints.getOrElse(defaultStoryPoints), newCard.tags.getOrElse(defaultCardTag),
            newCard.summary.getOrElse(defaultDescription))
          db.engine
            .run(insertQuery)
            .flatMap(id =>
              db.engine.run(cards.filter(_.id === id).result.headOption).map {
                case None             => Left(NotFound)
                case Some(card: Card) => Right(card)
              }
            )
      }

  def patch(db: Databases, workspaceId: Int, cardId: Int, patch: PatchCard): Future[StatusCode Either Card] =
    db.engine
      .run(
        cards.filter(c => c.workspaceId === workspaceId && c.title === patch.title).result.headOption
      )
      .flatMap {
        case None          => Future(Left(NotFound))
        case Some(current) =>
          val cardType = CardType.determineEnumValue(patch.cardType, current.cardType)
          val status   = Status.determineEnumValue(patch.status, current.status)
          val priority = Priority.determineEnumValue(patch.priority, current.priority)
          db.engine
            .run(
              cards
                .filter(_.id === cardId)
                .map(c =>
                  (
                    c.workspaceId,
                    c.status,
                    c.projectId,
                    c.project,
                    c.cardType,
                    c.title,
                    c.assignee,
                    c.priority,
                    c.storyPoints,
                    c.tags,
                    c.summary
                  )
                )
                .update(
                  workspaceId,
                  status,
                  patch.projectId.getOrElse(current.projectId),
                  patch.project.getOrElse(current.project),
                  cardType,
                  patch.title.getOrElse(current.title),
                  patch.assignee.getOrElse(current.assignee),
                  priority,
                  patch.storyPoints.getOrElse(current.storyPoints),
                  patch.tags.getOrElse(current.tags),
                  patch.summary.getOrElse(current.summary)
                )
            )
            .flatMap(_ =>
              get(db, workspaceId, cardId).map {
                case Some(card: Card) => Right(card)
                case _                => Left(Conflict)
              }
            )
      }

  def delete(db: Databases, workspaceId: Int, cardId: Int): Future[StatusCode Either Int] =
    db.engine.run(cards.filter(c => c.id === cardId && c.workspaceId === workspaceId).result.headOption).flatMap {
      case None => Future(Left(NotFound))
      case _    =>
        db.engine.run(cards.filter(c => c.id === cardId && c.workspaceId === workspaceId).delete).map { case _ =>
          Right(1)
        }
    }
}
