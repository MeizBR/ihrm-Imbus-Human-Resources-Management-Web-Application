package models

import api.enumeration.{GlobalRole, LeaveType, State}
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.apache.pekko.http.scaladsl.model.StatusCodes.{Forbidden, InternalServerError, NotFound, UnprocessableEntity}
import api.generated.leaves.{PatchLeave, PostLeave, PutLeave}
import db.{Databases, Leave, Schema, SummaryLeave}
import utils.DefaultValues._
import utils.EmailSender

import java.time.{Instant, LocalDate, ZoneId}
import java.util.TimeZone
import scala.concurrent.ExecutionContext.global
import scala.concurrent.{Await, ExecutionContextExecutor, Future}
import utils.RestErrorFactory._
import wsActor.NotificationManager.{leaveNotificationForAdmin, leaveNotificationForUser}

import scala.concurrent.duration.Duration

object Leaves extends Schema {

  import config.profile.api._

  given ec: ExecutionContextExecutor = global

  def localDateToLong(ld: LocalDate): Long = ld.atStartOfDay(ZoneId.of("UTC")).toEpochSecond

  def get(db: Databases, workspaceId: Int, leaveId: Int): Future[Option[Leave]] =
    db.engine.run(leaves.filter(l => l.id === leaveId && l.workspaceId === workspaceId).result.headOption)

  def getAll(db: Databases, workspaceId: Int, usersId: Option[Seq[Int]]): Future[Seq[Leave]] =
    usersId.fold(db.engine.run(leaves.filter(_.workspaceId === workspaceId).result)) { usersId =>
      db.engine.run(leaves.filter(l => l.workspaceId === workspaceId && (l.userId inSet usersId)).result)
    }

  def getAllSummaryLeaves(
      db: Databases,
      workspaceId: Int,
      usersId: Option[Seq[Int]],
      state: Option[String],
      from: Option[java.time.LocalDate],
      to: Option[java.time.LocalDate]
  ): Future[Seq[SummaryLeave]] = {
    val fromLong = from.map(lc => localDateToLong(lc)).getOrElse(-1L)
    val endLong  = to.map(lc => localDateToLong(lc)).getOrElse(Long.MaxValue)
    if (state.isEmpty) {
      usersId
        .fold(
          db.engine.run(
            leaves.filter(l => l.workspaceId === workspaceId && (l.start >= fromLong) && (l.end <= endLong)).result
          )
        )(usersId =>
          db.engine.run(
            leaves
              .filter(l =>
                (l.workspaceId === workspaceId) && (l.userId inSet usersId)
                  && (l.start >= fromLong) && (l.end <= endLong)
              )
              .result
          )
        )
        .map(
          _.map(leaveDb =>
            SummaryLeave(
              workspaceId,
              leaveDb.leaveId,
              leaveDb.start,
              leaveDb.isFullDayStart,
              leaveDb.end,
              leaveDb.isFullDayEnd,
              leaveDb.daysNumber,
              leaveDb.userId,
              leaveDb.adaptedLeaveType,
              leaveDb.adaptedLeaveState
            )
          )
        )
    } else {
      val newState = State.determineEnumValue(state, defaultLeaveState)
      usersId
        .fold(
          db.engine.run(
            leaves
              .filter(l =>
                (l.workspaceId === workspaceId) && (l.start >= fromLong) && (l.end <= endLong) && (l.state === newState.id)
              )
              .result
          )
        )(usersId =>
          db.engine.run(
            leaves
              .filter(l =>
                (l.workspaceId === workspaceId) && (l.userId inSet usersId) && (l.start >= fromLong)
                  && (l.end <= endLong) && (l.state === newState.id)
              )
              .result
          )
        )
        .map(
          _.map(leaveDb =>
            SummaryLeave(
              workspaceId,
              leaveDb.leaveId,
              leaveDb.start,
              leaveDb.isFullDayStart,
              leaveDb.end,
              leaveDb.isFullDayEnd,
              leaveDb.daysNumber,
              leaveDb.userId,
              leaveDb.adaptedLeaveType,
              leaveDb.adaptedLeaveState
            )
          )
        )
    }
  }

  def create(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      newLeave: PostLeave
  ): Future[(StatusCode, String) Either Leave] =
    db.engine
      .run(users.filter(user => user.workspaceId === workspaceId && user.id === userId).result.headOption)
      .flatMap {
        case Some(user) =>
          if (user.active)
            if (newLeave.start.isAfter(newLeave.end))
              Future(Left(UnprocessableEntity, "Start date should be before end date."))
            else if (newLeave.start.isEqual(newLeave.end) && (newLeave.isFullDayStart != newLeave.isFullDayEnd)) {
              Future(Left(UnprocessableEntity, "Start and end dates must be both full or half."))
            } else {
              db.engine
                .run(leaves.filter(leave => leave.workspaceId === workspaceId && leave.userId === userId).result)
                .flatMap {
                  case leaves
                      if leaves.filter(leave =>
                        ((leave.start to leave.end) intersect (localDateToLong(newLeave.start) to localDateToLong(
                          newLeave.end
                        ))).isEmpty || leave.state == State.Canceled.id || leave.state == State.Refused.id
                      )
                        == leaves =>
                    insertLeave(db, workspaceId, userId, newLeave).flatMap {
                      case Right(leave) =>
                        Await.result(Users.getAdminsEmails(db, workspaceId), Duration.Inf) match {
                          case emails =>
                            val emailBody =
                              s"Leave request for user ${user.firstName} ${user.lastName}: <br>" +
                                s"Start Date: ${newLeave.start}, <br>" +
                                s"End Date: ${newLeave.end}, <br>" +
                                s"Number of Days: ${newLeave.daysNumber}, <br>" +
                                s"Description: ${newLeave.description}"

                            EmailSender.sendEmail(emails, emailBody) // .recover { case _ => Right(leave) }
                            leaveNotificationForAdmin(workspaceId, leave, db)
                            Future.successful(Right(leave))

                        }

                      case Left(error) => Future.successful(Left(error))
                    }

                  case _ => Future(Left(leaveAlreadyExistsCreateError))
                }
            }
          else Future(Left(Forbidden, "You cannot create a leave for an inactive user."))
        case None       => Future(Left(NotFound, "Not found."))
      }

  private def insertLeave(
      db: Databases,
      workspaceId: Int,
      userId: Int,
      newLeave: PostLeave
  ): Future[Either[(StatusCodes.ClientError, String), Leave]] = {
    val leaveType = LeaveType.determineEnumValue(Some(newLeave.leaveType), defaultLeaveType)
    val state     = State.determineEnumValue(newLeave.state, defaultLeaveState)
    // TODO: This check makes no sense, since the leave is created with default state waiting
    if (state != State.Canceled || state != State.Refused) {
      val insertQuery = (leaves.map(l =>
        (
          l.workspaceId,
          l.start,
          l.isFullDayStart,
          l.end,
          l.isFullDayEnd,
          l.daysNumber,
          l.userId,
          l.leaveType,
          l.description,
          l.state,
          l.comment
        )
      ) returning leaves.map(_.id)) +=
        (
          (
            workspaceId,
            localDateToLong(newLeave.start),
            newLeave.isFullDayStart,
            localDateToLong(newLeave.end),
            newLeave.isFullDayEnd,
            newLeave.daysNumber,
            userId,
            leaveType.id,
            newLeave.description,
            state.id,
            ""
          )
        )
      db.engine
        .run(insertQuery)
        .flatMap(id =>
          db.engine.run(leaves.filter(_.id === id).result.headOption).map {
            case None               => Left(NotFound, "Not Found.")
            case Some(leave: Leave) => Right(leave)
          }
        )
    } else {
      Future(Left(Forbidden, "Unable to insert leave."))
    }
  }

  private def isFullDaysDifferent(current: Leave, patch: PatchLeave): Boolean = {
    val start          = patch.start.fold(current.start)(localDateToLong)
    val end            = patch.end.fold(current.end)(localDateToLong)
    val isFullDayStart = patch.isFullDayStart.getOrElse(current.isFullDayStart)
    val isFullDayEnd   = patch.isFullDayEnd.getOrElse(current.isFullDayEnd)

    start.equals(end) && isFullDayStart != isFullDayEnd
  }

  def patch(
      db: Databases,
      workspaceId: Int,
      leaveId: Int,
      patch: PatchLeave
  ): Future[(StatusCode, String) Either Leave] =
    db.engine.run(leaves.filter(leave => leave.id === leaveId).result.headOption).flatMap {
      case None          => Future(Left(NotFound, "Not found."))
      case Some(current) =>
        val isGivenStartAfterGivenEndDate   = patch.start.exists(st => patch.end.fold(false)(end => st.isAfter(end)))
        val localDateEnd                    = LocalDate.ofInstant(Instant.ofEpochSecond(current.end), TimeZone.getDefault.toZoneId)
        val isGivenStartAfterCurrentEndDate = patch.start.exists(_.isAfter(localDateEnd))
        if (
          patch.end.nonEmpty && patch.start.nonEmpty && isGivenStartAfterGivenEndDate || patch.end.isEmpty && isGivenStartAfterCurrentEndDate
        )
          Future(Left(UnprocessableEntity, "Start date should be before end date."))
        else if (isFullDaysDifferent(current, patch))
          Future(Left(UnprocessableEntity, "Start and end dates must be both full or half."))
        else {
          val maybeStart =
            patch.start.map(i => localDateToLong(i)).getOrElse(Long.MaxValue)
          db.engine
            .run(
              leaves
                .filter(leave =>
                  (leave.workspaceId === workspaceId) && (leave.userId === current.userId) && (leave.start === maybeStart) && (leave.id =!= leaveId)
                )
                .result
                .headOption
            )
            .flatMap {
              case Some(_) =>
                Future(Left(leaveAlreadyExistsUpdateError))
              case None    =>
                val newLeaveType = LeaveType.determineEnumValue(patch.leaveType, current.adaptedLeaveType)
                current.adaptedLeaveState match {
                  case State.Waiting    =>
                    db.engine
                      .run(
                        leaves
                          .filter(_.id === leaveId)
                          .map(l =>
                            (
                              l.start,
                              l.isFullDayStart,
                              l.end,
                              l.isFullDayEnd,
                              l.daysNumber,
                              l.userId,
                              l.leaveType,
                              l.description
                            )
                          )
                          .update(
                            patch.start.fold(current.start)(s => localDateToLong(s)),
                            patch.isFullDayStart.getOrElse(current.isFullDayStart),
                            patch.end.fold(current.end)(s => localDateToLong(s)),
                            patch.isFullDayEnd.getOrElse(current.isFullDayEnd),
                            patch.daysNumber.getOrElse(current.daysNumber),
                            current.userId,
                            newLeaveType.id,
                            patch.description.getOrElse(current.description)
                          )
                      )
                      .flatMap(_ =>
                        get(db, workspaceId, leaveId).map {
                          case Some(leave: Leave) => Right(leave)
                          case _                  => Left(leaveAlreadyExistsCreateError)
                        }
                      )
                  case State.InProgress =>
                    db.engine
                      .run(
                        leaves
                          .filter(_.id === leaveId)
                          .map(_.description)
                          .update(patch.description.getOrElse(current.description))
                      )
                      .flatMap(_ =>
                        get(db, workspaceId, leaveId).map {
                          case Some(leave: Leave) => Right(leave)
                          case _                  => Left(leaveAlreadyExistsCreateError)
                        }
                      )
                  case _                => Future(Left(updateLeaveIsNotAllowed(current.adaptedLeaveState)))
                }
            }
        }
    }

  private def putLeave(
      db: Databases,
      workspaceId: Int,
      leaveId: Int,
      newState: State,
      newComment: String,
      userComment: Option[String],
      isAdmin: Boolean
  ): Future[(StatusCode, String) Either Leave] =
    if (!isAdmin && userComment.nonEmpty)
      Future(Left(Forbidden, "Unable to update the comment."))
    else {
      db.engine
        .run(
          leaves.filter(_.id === leaveId).map(l => (l.state, l.comment)).update(newState.id, newComment)
        )
        .flatMap(_ =>
          get(db, workspaceId, leaveId).map {
            case Some(leave: Leave) =>
              leaveNotificationForUser(workspaceId, leave, db)
              Right(leave)
            case _                  => Left(leaveAlreadyExistsUpdateError)
          }
        )
    }

  def put(
      db: Databases,
      workspaceId: Int,
      connectedUserId: Int,
      leaveId: Int,
      put: PutLeave,
      globalRoles: Set[GlobalRole]
  ): Future[(StatusCode, String) Either Leave] =
    db.engine.run(leaves.filter(leave => leave.id === leaveId).result.headOption).flatMap {
      case Some(current) =>
        lazy val newLeaveState = State.determineEnumValue(put.state, current.adaptedLeaveState)
        lazy val isAdmin       = globalRoles.contains(GlobalRole.Administrator)
        lazy val isOwnLeave    = current.userId.equals(connectedUserId)
        if (isAdmin) current.adaptedLeaveState match {
          case State.Waiting | State.InProgress if isValidState(put.state, isOwnLeave) =>
            putLeave(db, workspaceId, leaveId, newLeaveState, put.comment.getOrElse(current.comment), None, isAdmin)
          case State.Approved | State.Refused if isFromValidStateToWaiting(put)        =>
            putLeave(db, workspaceId, leaveId, newLeaveState, put.comment.getOrElse(current.comment), None, isAdmin)
          case _                                                                       =>
            put.state.fold(
              putLeave(
                db,
                workspaceId,
                leaveId,
                current.adaptedLeaveState,
                put.comment.getOrElse(current.comment),
                None,
                isAdmin
              )
            ) { newState =>
              if (!isOwnLeave && newState.contains(State.Canceled.toString))
                Future(Left(leaveCancelIsNotAllowed()))
              else if (!State.values.exists(_.toString == newState))
                Future(Left(UnprocessableEntity, "Invalid enumeration value."))
              else Future(Left(updateLeaveIsNotAllowed(current.adaptedLeaveState)))
            }
        }
        else
          current.adaptedLeaveState match {
            case State.InProgress | State.Waiting if put.state.isEmpty || put.state.contains(State.Canceled.toString) =>
              putLeave(
                db,
                workspaceId,
                leaveId,
                newLeaveState,
                put.comment.getOrElse(current.comment),
                put.comment,
                isAdmin
              )
            case _                                                                                                    =>
              Future(Left(UnprocessableEntity, "Unable to update leave status or Invalid enumeration value."))
          }
      case None          => Future(Left(NotFound, "Not found."))
      // case _             => Future(Left(InternalServerError, "Internal Server Error\", \"There was an internal server error."))
    }

  private def isValidState(newState: Option[String], isOwnLeave: Boolean): Boolean =
    newState.fold(true)(state => state != State.Canceled.toString || (isOwnLeave && state == State.Canceled.toString))

  private def isFromValidStateToWaiting(newState: PutLeave): Boolean =
    newState.state.fold(true)(state => state == State.Waiting.toString)
}
