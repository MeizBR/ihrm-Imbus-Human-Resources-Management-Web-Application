import utils.ClassLogging
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Failure

package object models extends ClassLogging {

//  implicit class FutureOpts(val f: Future[?]) {
//    def asUnit(using ec: ExecutionContext): Future[Unit] = f.map(_ => ())
//  }

  extension (f: Future[?])(using ExecutionContext) def asUnit: Future[Unit] = f.map(_ => ())

//  implicit class FutureOp[R](val f: Future[R]) {
//    def handleError(msg1: String, result: R)(using ec: ExecutionContext): Future[R] = f.recover { case e: Exception =>
//      log.error(s"$msg1:\n$e")
//      result
//    }
//  }

  extension [R](f: Future[R])(using ExecutionContext)
    def handleError(msg1: String, result: R): Future[R] =
      f.recover { case e: Exception =>
        log.error(s"$msg1:\n$e")
        result
      }

}
