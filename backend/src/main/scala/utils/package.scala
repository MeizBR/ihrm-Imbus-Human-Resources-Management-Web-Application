import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.{CountDownLatch, TimeUnit}
package object utils extends ClassLogging {
  def waitForTermination(isFinished: CountDownLatch): String = {
    val waitingThread             = Thread.currentThread()
    val interruptedByShutdownHook = new AtomicBoolean(false)
    val shutdownHook              = new Thread(new Runnable {
      override def run(): Unit = {
        interruptedByShutdownHook.set(true)
        waitingThread.interrupt()
        isFinished.await(30, TimeUnit.SECONDS)
      }
    })
    Runtime.getRuntime.addShutdownHook(shutdownHook)
    try {
      while (System.in.available() == 0) Thread.sleep(200)
      Runtime.getRuntime.removeShutdownHook(shutdownHook)
      while (System.in.available() > 0) System.in.readNBytes(System.in.available())
      "stdin input"
    } catch { case e: InterruptedException => if (interruptedByShutdownHook.get()) "shutdown hook" else "interrupt" }
  }

  // Will become obsolete with Scala 2.13
  def using[S <: AutoCloseable, T](resource: S)(f: S => T): T =
    try f(resource)
    finally resource.close()

  // Will become obsolete with Scala 2.13
  implicit final class ChainingOps[A](val self: A) extends AnyVal {
    def tap[U](f: A => U): A  = { f(self); self }
    def pipe[B](f: A => B): B = f(self)
  }

  implicit final class HashedString(val str: String) {
    private val salt   = "FhGtEdLi6r-4$§li".getBytes("UTF-8")
    private val pepper = "HDX?kd3m$e~w#j7a".getBytes("UTF-8")

    def hashed: String = {
      val digest = java.security.MessageDigest.getInstance("SHA-256")
      digest.update(str.getBytes("UTF-8"))
      digest.update(pepper)
      // https://stackoverflow.com/questions/1347646/postgres-error-on-insert-error-invalid-byte-sequence-for-encoding-utf8-0x0
      new String(digest.digest(salt), "UTF-8").replaceAll("\u0000", "")
    }
  }
}
