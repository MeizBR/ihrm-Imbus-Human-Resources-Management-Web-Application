package models

import db.Schema
import db.{Databases, SuperAdmin}

import scala.concurrent.{ExecutionContextExecutor, Future}
import utils._

import scala.concurrent.ExecutionContext.global

object SuperAdmins extends Schema with ClassLogging {
  import config.profile.api._
  given ec: ExecutionContextExecutor = global

  def checkCredentials(db: Databases, login: String, password: String): Future[Option[SuperAdmin]] = {
    val query = superAdmins.filter(a => a.login === login && a.hashedPassword === password.hashed)
    db.engine.run(query.result.headOption)
  }
}
