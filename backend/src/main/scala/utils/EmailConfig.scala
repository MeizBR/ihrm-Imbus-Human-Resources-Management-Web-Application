package utils
import com.typesafe.config.{Config, ConfigFactory}
object EmailConfig {
  private val defaultConfig: Config = ConfigFactory.load()
  private val emailConfig: Config   =
    try
      defaultConfig.getConfig("email")
    catch {
      case _: Throwable =>
        println("Error: Missing or invalid email configuration. Using default configuration.")
        defaultConfig
    }

  val smtpAuth: String     = emailConfig.getString("smtp.auth")
  val smtpStartTLS: String = emailConfig.getString("smtp.starttls")
  val password: String     = emailConfig.getString("smtp.password")
  val smtpHost: String     = emailConfig.getString("smtp.host")
  val smtpPort: String     = emailConfig.getString("smtp.port")
  val username: String     = emailConfig.getString("smtp.username")
  val subject: String      = emailConfig.getString("subject")
}
