package db

import utils.ClassLogging

import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.util.Try

object ResetDatabase extends App with Schema with ClassLogging with TestData {

  import config.profile.api._
  val tablesSchema = List(
    superAdmins,
    workspaces,
    customers,
    projects,
    users,
    projectUsers,
    activities,
    calendars,
    leaves,
    tasks,
    cards,
    events,
    notifications,
    dbVersions
  )

  /** Resets database : drops all tables , recreate them and add system data ( one super-admin & db version )
    */
  lazy val setup = DBIO.sequence(tablesSchema.collect { case table =>
    table.schema.dropIfExists.andThen(table.schema.create)
  })

  Try {
    Await.result(engine.run((setup >> addDbVersion >> addSuperAdmins).transactionally), Duration.Inf)
    log.info("Finished database reset :")
    log.info("\t - Dropped tables")
    log.info("\t - Created tables")
    log.info("\t - Inserted system data")
  }.recover { case e: Throwable =>
    log.error(s"Failed to reset database: ${e.getMessage}")
  }
}
