package tests.api.Users

import org.specs2.specification.core.SpecStructure
import api.generated.users.{Password, PatchUser, PatchUserBySuperAdmin, User}
import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import org.specs2.matcher.MatchResult
import utils.RestErrorFactory.Failure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.{UserCalls, WorkspaceCalls}
import utils.HttpClient.Result

class PatchUserSpec extends RestCallsSpec with UserCalls with WorkspaceCalls with Authentication with HttpClient {
  override def is: SpecStructure = "Specification to check the patch user rest calls".title ^ sequential ^
    s2"""
     The default workspace admin can:
        edit a user                                                                                       $p1
        edit his self                                                                                     $p2

     The default workspace admin cannot:
        edit him self with workspace not found                                                            $n1
        edit user with an existing login                                                                  $n2
        edit user with an existing email                                                                  $n3
        edit another user's password with a wrong password                                                $n7
        edit user's password with invalid format                                                          $n9
        edit user with a non existing userId                                                              $n10             
        make him self inactive                                                                            $n12

     The default super admin can:
        edit a user                                                                                       $p3

     The default super admin cannot:
        edit user with a non existing workspaceId                                                         $n4
        edit user with an existing login                                                                  $n5
        edit user with an existing email                                                                  $n6
        edit user's password with invalid format                                                          $n8
        edit user with a non existing userId                                                              $n11
      """

  private def p1: MatchResult[Result[User]] =
    patchUser(
      workspaceId = 1,
      userId = Some(6),
      patch = PatchUser(
        None,
        None,
        Some("newLogin"),
        Some("updatedmail@hotmail.com"),
        Some(Password("admin", "user12345678")),
        None,
        None
      )
    )(using workspaceAdminToken) should beRight { (user: User) =>
      user.firstName === "Said" and user.lastName === "Med Bechir" and
      user.login === "newLogin" and
      user.email === "updatedmail@hotmail.com" and
      user.note === "" and user.isActive === true
    }

  private def p2: MatchResult[Result[User]] =
    patchUser(
      workspaceId = 1,
      userId = None,
      patch = PatchUser(
        Some("Mouelhi"),
        Some("Amel"),
        Some("admin"),
        Some("admin@gmail.com"),
        None,
        Some(""),
        Some(true)
      )
    )(using
      workspaceAdminToken
    ) should beRight { (self: User) =>
      self.firstName === "Mouelhi" and self.lastName === "Amel" and
      self.login === "admin"
      self.email === "admin@gmail.com" and self.isActive === true
    }

  private def p3: MatchResult[Result[User]] = patchUserBySuperAdmin(
    workspaceId = 1,
    userId = 1,
    patch = PatchUserBySuperAdmin(
      Some("firstName_byAdmin"),
      Some("lastName_byAdmin"),
      Some("updated.user.login"),
      Some("updateduser@outlook.com"),
      None,
      Some("Updated description by admin"),
      Some(true)
    )
  )(using superAdminToken) should beRight { (user: User) =>
    user.login === "updated.user.login"
    user.firstName === "firstName_byAdmin" and user.lastName === "lastName_byAdmin"
    user.email === "updateduser@outlook.com" and
    user.note === "Updated description by admin" and user.isActive === true
  }

  private def n1: MatchResult[Result[User]] =
    patchUser(
      workspaceId = 404,
      userId = None,
      patch = PatchUser(
        Some("Mwelhi"),
        Some("Amel"),
        Some("admin"),
        Some("adminmail@gmail.com"),
        None,
        Some(""),
        Some(true)
      )
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n2: MatchResult[Result[User]] = patchUser(
    workspaceId = 1,
    userId = Some(3),
    patch = PatchUser(
      Some("test_firstName"),
      Some("test_lastName"),
      Some("manager"),
      Some("updateduser@hotmail.fr"),
      None,
      Some(""),
      Some(true)
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Conflict
    response._2 === Failure("Login already exists.")
  }

  private def n3: MatchResult[Result[User]] = patchUser(
    workspaceId = 1,
    userId = Some(1),
    patch = PatchUser(
      Some("test_firstName"),
      Some("test_lastName"),
      Some("updated.user.login"),
      Some("manager@gmail.com"),
      None,
      Some(""),
      Some(true)
    )
  )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Conflict
    response._2 === Failure("Email already exists.")
  }

  private def n4: MatchResult[Result[User]] = patchUserBySuperAdmin(
    workspaceId = 404,
    userId = 4,
    patch = PatchUserBySuperAdmin(
      Some("test_firstName"),
      Some("test_lastName"),
      Some("updateduser"),
      Some("updateduser@hotmail.fr"),
      None,
      Some(""),
      Some(true)
    )
  )(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
    response._2 === Failure("Workspace not found.")
  }

  private def n5: MatchResult[Result[User]] = patchUserBySuperAdmin(
    workspaceId = 1,
    userId = 1,
    patch = PatchUserBySuperAdmin(
      Some("test_firstName"),
      Some("test_lastName"),
      Some("manager"),
      Some("updateduser@hotmail.fr"),
      None,
      Some(""),
      Some(true)
    )
  )(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Conflict
    response._2 === Failure("Login already exists.")
  }

  private def n6: MatchResult[Result[User]] = patchUserBySuperAdmin(
    workspaceId = 1,
    userId = 3,
    patch = PatchUserBySuperAdmin(
      Some("test_firstName"),
      Some("test_lastName"),
      Some("updated.user.login"),
      Some("manager@gmail.com"),
      None,
      Some(""),
      Some(true)
    )
  )(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Conflict
    response._2 === Failure("Email already exists.")
  }

  private def n7: MatchResult[Result[User]] =
    patchUser(
      workspaceId = 1,
      userId = Some(6),
      patch = PatchUser(
        None,
        None,
        None,
        None,
        Some(Password("admin1230", "member1230")),
        None,
        None
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
      response._2 === Failure("Wrong password.")
    }

  private def n8: MatchResult[Result[User]] = patchUserBySuperAdmin(
    workspaceId = 1,
    userId = 1,
    patch = PatchUserBySuperAdmin(
      None,
      None,
      None,
      None,
      Some("test"),
      None,
      None
    )
  )(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.Forbidden
    response._2 === Failure("Invalid password format.")
  }

  private def n9: MatchResult[Result[User]] =
    patchUser(
      workspaceId = 1,
      userId = Some(6),
      patch = PatchUser(
        None,
        None,
        None,
        None,
        Some(Password("admin", "test")),
        None,
        None
      )
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
      response._2 === Failure("Invalid password format.")
    }

  private def n10: MatchResult[Result[User]] =
    patchUser(
      workspaceId = 1,
      userId = Some(404),
      patch = PatchUser(
        None,
        None,
        None,
        None,
        Some(Password("admin", "test1230")),
        None,
        None
      )
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound
      response._2 === Failure("Not found.")
    }
  private def n11: MatchResult[Result[User]] = patchUserBySuperAdmin(
    workspaceId = 1,
    userId = 404,
    patch = PatchUserBySuperAdmin(
      None,
      None,
      None,
      None,
      None,
      None,
      None
    )
  )(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
    response._1 === StatusCodes.NotFound
    response._2 === Failure("User not found.")
  }

  private def n12: MatchResult[Result[User]] =
    patchUser(
      workspaceId = 1,
      userId = Some(1),
      patch = PatchUser(
        None,
        None,
        None,
        None,
        None,
        None,
        Some(false)
      )
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
      response._2 === Failure("Forbidden or workspace not found.")
    }
}
