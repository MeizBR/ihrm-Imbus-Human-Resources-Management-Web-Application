package db

import org.apache.pekko.actor.{ActorSystem, Terminated}
import utils._

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}

case class Databases(devMode: Boolean)(using actor: ActorSystem) extends Schema with TestData with ClassLogging {

  import config.profile.api._

  lazy val checkDbVersion: Option[Future[Terminated]] =
    try
      Await.result(engine.run(dbVersions.result.headOption), Duration.Inf) match {
        case Some(DbVersion(dbVersion)) if dbVersion != currentDbVersion =>
          log.error(
            s"Version of live database ($dbVersion) does not match expected version ($currentDbVersion). Please ensure that all database upgrade scripts have been run."
          )
          Some(actor.terminate())
        case None                                                        =>
          log.error(s"Could not read version of live database. Expected version is $currentDbVersion.")
          Some(actor.terminate())
        case _                                                           =>
          log.info(s"Connection successfully established with database with live version $currentDbVersion.")
          None
      }
    catch {
      case e: Exception =>
        log.error(s"${e.getMessage}")
        Some(actor.terminate())
    }

  // init db
  def initDb = {
    log.info("Start to Drop, create tables....")
    val setup = DBIO.seq(
      superAdmins.schema.dropIfExists,
      superAdmins.schema.create,
      workspaces.schema.dropIfExists,
      workspaces.schema.create,
      customers.schema.dropIfExists,
      customers.schema.create,
      projects.schema.dropIfExists,
      projects.schema.create,
      users.schema.dropIfExists,
      users.schema.create,
      projectUsers.schema.dropIfExists,
      projectUsers.schema.create,
      activities.schema.dropIfExists,
      activities.schema.create,
      calendars.schema.dropIfExists,
      calendars.schema.create,
      leaves.schema.dropIfExists,
      leaves.schema.create,
      tasks.schema.dropIfExists,
      tasks.schema.create,
      cards.schema.dropIfExists,
      cards.schema.create,
      events.schema.dropIfExists,
      events.schema.create,
      dbVersions.schema.dropIfExists,
      dbVersions.schema.create,
      notifications.schema.dropIfExists,
      notifications.schema.create
    )
    log.info("tables dropped and created successfully ....")
    log.info("start to insert data ...")
    engine.run(
      setup >> addSuperAdmins >> addWorkSpaces >> addUsers >>
        addCustomers >>
        addProjects >> addProjectUsers >>
        addActivities >> addCalenders >>
        addLeaves >> addTasks >> addCards >> addEvents
    )
  }

  def close(): Unit =
    engine.close
}
