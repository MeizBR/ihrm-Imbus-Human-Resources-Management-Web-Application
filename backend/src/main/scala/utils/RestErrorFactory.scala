package utils

import api.enumeration.{ProjectRole, State}
import org.apache.pekko.http.scaladsl.model.StatusCode
import org.apache.pekko.http.scaladsl.model.StatusCodes._
//import utils.pekkohttpcirce.FailFastCirceSupport._
//import io.circe.generic.auto._
//import io.circe.syntax._
object RestErrorFactory {
  case class Failure(failureType: String)

  object Failure {
    given decoder: io.circe.Decoder[Failure] = io.circe.generic.semiauto.deriveDecoder
    given encoder: io.circe.Encoder[Failure] = io.circe.generic.semiauto.deriveEncoder
  }

  private def e(code: StatusCode, failureType: String) = code -> Failure(failureType = failureType)

  def invalidTokenHeaderResponse: (StatusCode, Failure) = e(Unauthorized, "Unauthorized")

  def missingTokenHeaderResponse: (StatusCode, Failure) = e(BadRequest, "MissingHeader")

  def missingTenantAdminRole: (StatusCode, Failure) = e(Forbidden, "Missing global role: WorkspaceAdmin")

  def missingProjectRoles(roles: Seq[ProjectRole]): (StatusCode, Failure) =
    e(Forbidden, roles.mkString("Missing project roles:", ",", ""))

  def internalServerError: (StatusCode, String) =
    (InternalServerError, "Internal Server Error\", \"There was an internal server error.")

  def serviceUnavailable: (StatusCode, Failure) = e(ServiceUnavailable, "ServiceUnavailable")

  def resourceNotFound: (StatusCode, String) = (NotFound, "Not found.")

  def userAlreadyExistError: (StatusCode, Failure) =
    e(Conflict, "Unable to create a user, there is another user with the same name or / and the same email.")

  def invalidEmailOrPassword: (StatusCode, Failure) = e(UnprocessableEntity, "Invalid email or password format.")

  def missingRolesOrWorkspaceNotFound: (StatusCode, String) = (Forbidden, "Forbidden or workspace not found.")

  def deleteRoleLeadIsNotAllowed(): (StatusCode, String) = (Forbidden, "Cannot delete lead role.")

  def leaveAlreadyExistsCreateError: (StatusCode, String) =
    (Conflict, "Unable to create leave (There is another leave on this date).")

  def roleDeletionFailed: (StatusCode, String) = (InternalServerError, "Failed to delete role.")

  def leaveAlreadyExistsUpdateError: (StatusCode, String) =
    (Conflict, "Unable to update leave (There is another leave on this date).")

  def updateLeaveIsNotAllowed(state: State): (StatusCode, String) =
    (UnprocessableEntity, s"Unable to update leave (leave is ${state.toString}).")

  def inactiveUser: (StatusCode, String) = (Forbidden, "You cannot set project roles to an inactive user.")
  // def inactiveUser: (StatusCode, Failure) = e(Forbidden, "You cannot set project roles to an inactive user.")

  def leaveCancelIsNotAllowed(): (StatusCode, String) =
    (Forbidden, "Unable to cancel this leave, you are not the owner.")
}
