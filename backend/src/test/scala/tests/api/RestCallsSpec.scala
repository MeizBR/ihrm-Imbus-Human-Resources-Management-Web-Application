package tests.api

import ihrm.Server
import org.specs2.SpecificationLike
import org.specs2.specification.BeforeAfterAll
import utils.HttpClient

trait RestCallsSpec extends SpecificationLike with BeforeAfterAll {
  self: HttpClient =>

  protected val server: Thread = preparedServer

  override def beforeAll(): Unit = {
    Server.isRunning.await()
    assert(server.isAlive, "Server is not running.")
  }

  override def afterAll(): Unit = {
    server.interrupt()
    shutdown()
  }
}
