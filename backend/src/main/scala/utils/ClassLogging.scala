package utils

import org.slf4j.{Logger, LoggerFactory}

trait ClassLogging {
  given log: Logger = LoggerFactory.getLogger(getClass.getName.stripSuffix("$"))
}
