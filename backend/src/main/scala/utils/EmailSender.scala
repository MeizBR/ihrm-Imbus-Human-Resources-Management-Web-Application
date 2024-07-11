package utils

import java.util.Properties
import javax.mail._
import javax.mail.internet._
import scala.concurrent.{ExecutionContext, Future}
object EmailSender {
  private val session: Session = {
    val props = new Properties()
    props.put("mail.smtp.auth", EmailConfig.smtpAuth)
    props.put("mail.smtp.starttls.enable", EmailConfig.smtpStartTLS)
    props.put("mail.smtp.host", EmailConfig.smtpHost)
    props.put("mail.smtp.port", EmailConfig.smtpPort)

    Session.getInstance(
      props,
      new javax.mail.Authenticator() {
        override def getPasswordAuthentication: PasswordAuthentication =
          new PasswordAuthentication(EmailConfig.username, EmailConfig.password)
      }
    )
  }

  def sendEmail(adminEmails: Seq[String], body: String)(implicit
      ec: ExecutionContext
  ): Future[Either[Throwable, Unit]] = Future {
    try {
      val message = new MimeMessage(session)
      message.setFrom(new InternetAddress(EmailConfig.username))
      adminEmails.foreach(email => message.addRecipient(Message.RecipientType.TO, new InternetAddress(email)))
      message.setSubject(EmailConfig.subject)
      message.setContent(body, "text/html; charset=utf-8")
      Transport.send(message)
      println("Email sent successfully!")
      Right(())
    } catch {
      case e: Exception =>
        e.printStackTrace()
        Left(e)
    }
  }
}
