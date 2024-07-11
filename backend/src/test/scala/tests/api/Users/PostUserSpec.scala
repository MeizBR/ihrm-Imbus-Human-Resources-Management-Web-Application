package tests.api.Users

import org.apache.pekko.http.scaladsl.model.{StatusCode, StatusCodes}
import api.generated.users.{PostUser, User}
import org.specs2.matcher.MatchResult
import org.specs2.specification.core.SpecStructure
import tests.api.RestCallsSpec
import utils.{Authentication, HttpClient}
import utils.Calls.UserCalls
import utils.HttpClient.Result
import utils.RestErrorFactory.Failure

class PostUserSpec extends RestCallsSpec with UserCalls with Authentication with HttpClient {

  override def is: SpecStructure = "Specification to check the post user rest calls".title ^ sequential ^
    s2"""
     The default workspace admin can:
        create a user                                                                                     $p1

     The default workspace admin cannot:
        create a user with an existing login                                                              $n1
        create a user with an existing email                                                              $n2
        create a user with a non existing workspaceId                                                     $n3
        create a user with invalid email                                                                  $n4
        create a user with invalid password ( minimum length is 6)                                        $n5

     The default super admin can:
        create a user                                                                                     $p2
        create a user with the same data of another existed user in another workspace                     $p3
        create a user with an existing login in another workspace                                         $p4
        create a user with an existing email in another workspace                                         $p5

     The default super admin cannot:
        create a user with invalid token                                                                  $n6
        create a user with an existing login                                                              $n7
        create a user with an existing email                                                              $n8
        create user with a non existing workspaceId                                                       $n9
        create a user with invalid email                                                                  $n10
        create a user with invalid password ( minimum length is 6)                                        $n11
      """

  private def p1: MatchResult[Result[User]] =
    postUser(
      workspaceId = 1,
      user = PostUser(
        "testFirstName",
        "testFastName",
        "newuser",
        "newuser@gmail.com",
        "aé&$1258m!",
        Some("Note space is reserved for administration"),
        Some(true)
      )
    )(using
      workspaceAdminToken
    ) should beRight { (user: User) =>
      user.firstName === "testFirstName" and user.lastName === "testFastName" and
      user.login === "newuser" and
      user.email === "newuser@gmail.com" and
      user.note === "Note space is reserved for administration" and
      user.isActive === true
    }

  private def p2: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 1,
      PostUser(
        "firstName_byAdmin",
        "lastName_byAdmin",
        "new.user",
        "newuser@hotmail.com",
        "newuser1234",
        Some("Note space is reserved for administration"),
        Some(true)
      )
    )(using
      superAdminToken
    ) should beRight { (user: User) =>
      user.firstName === "firstName_byAdmin" and user.lastName === "lastName_byAdmin" and
      user.login === "new.user"
      user.email === "newuser@hotmail.com" and
      user.note === "Note space is reserved for administration" and user.isActive === true
    }

  private def p3: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 2,
      PostUser(
        "testFirstName",
        "testFastName",
        "newuser",
        "newuser@gmail.com",
        "aé&$1258m!",
        Some("Note space is reserved for administration"),
        Some(true)
      )
    )(using
      superAdminToken
    ) should beRight { (user: User) =>
      user.firstName === "testFirstName" and user.lastName === "testFastName" and
      user.login === "newuser" and
      user.email === "newuser@gmail.com" and
      user.note === "Note space is reserved for administration" and
      user.isActive === true
    }

  private def p4: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 2,
      PostUser(
        "testFirstName",
        "testFastName",
        "manager",
        "new.user@gmail.com",
        "aé&$1258m!",
        Some("Note space is reserved for administration"),
        Some(true)
      )
    )(using
      superAdminToken
    ) should beRight { (user: User) =>
      user.firstName === "testFirstName" and user.lastName === "testFastName" and
      user.login === "manager" and
      user.email === "new.user@gmail.com" and
      user.note === "Note space is reserved for administration" and
      user.isActive === true
    }

  private def p5: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 2,
      PostUser(
        "testFirstName",
        "testFastName",
        "login",
        "manager@gmail.com",
        "aé&$1258m!",
        Some("Note space is reserved for administration"),
        Some(true)
      )
    )(using
      superAdminToken
    ) should beRight { (user: User) =>
      user.firstName === "testFirstName" and user.lastName === "testFastName" and
      user.login === "login" and
      user.email === "manager@gmail.com" and
      user.note === "Note space is reserved for administration" and
      user.isActive === true
    }

  private def n1: MatchResult[Result[User]] =
    postUser(
      workspaceId = 1,
      PostUser("test_firstName", "test_lastName", "manager", "manager_email@gmail.com", "test1", Some(""), Some(true))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
      response._2 === Failure("Login already exists.")
    }

  private def n2: MatchResult[Result[User]] =
    postUser(
      workspaceId = 1,
      PostUser("test_firstName", "test_lastName", "manager_login", "manager@gmail.com", "test1", Some(""), Some(true))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
      response._2 === Failure("Email already exists.")
    }

  private def n3: MatchResult[Result[User]] =
    postUser(
      workspaceId = 404,
      PostUser("test_firstName", "test_lastName", "manager", "manager@gmail.com", "test1", Some(""), Some(true))
    )(using workspaceAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
      response._2 === Failure("Forbidden or workspace not found.")
    }

  private def n4: MatchResult[Result[User]] =
    postUser(
      workspaceId = 1,
      PostUser(
        "test_firstName",
        "test_lastName",
        "new.user.login",
        "newuser@gmail",
        "newuser12345",
        Some(""),
        Some(true)
      )
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity // to be verified
    }

  private def n5: MatchResult[Result[User]] =
    postUser(
      workspaceId = 1,
      PostUser("test_firstName", "test_lastName", "new.login", "newuser@gmail.fr", "1234", Some(""), Some(true))
    )(using
      workspaceAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity
    }

  private def n6: MatchResult[Result[User]] =
    postUser(
      1,
      PostUser("test_firstName", "test_lastName", "newuser", "newuser@outlook.fr", "newuser1234", Some(""), Some(true))
    )(using "test_token") should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Forbidden
    }

  private def n7: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 1,
      PostUser("test_firstName", "test_lastName", "manager", "@hotmail.fr", "newuser1234", Some(""), Some(true))
    )(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
      response._2 === Failure("Login already exists.")
    }

  private def n8: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 1,
      PostUser("test_firstName", "test_lastName", "test", "manager@gmail.com", "newuser1234567", Some(""), Some(true))
    )(using superAdminToken) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.Conflict
      response._2 === Failure("Email already exists.")
    }

  private def n9: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 404,
      PostUser("test_firstName", "test_lastName", "newLogin", "test@hotmail.fr", "newuser1234", Some(""), Some(true))
    )(using
      superAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.NotFound
      response._2 === Failure("Workspace not found.")
    }

  private def n10: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 1,
      PostUser(
        "test_firstName",
        "test_lastName",
        "test.login",
        "newuser@hotmail.commm",
        "newuser12345",
        Some(""),
        Some(true)
      )
    )(using
      superAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity
    }

  private def n11: MatchResult[Result[User]] =
    postUserBySuperAdmin(
      workspaceId = 1,
      user =
        PostUser("test_firstName", "test_lastName", "test.login", "newuser@gmail.fr", "abc01", Some(""), Some(true))
    )(using
      superAdminToken
    ) should beLeft { (response: (StatusCode, Failure)) =>
      response._1 === StatusCodes.UnprocessableEntity
    }
}
