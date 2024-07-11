package utils

import scala.util.matching.Regex

object EmailValidator {
  private val simpleCharacter          = """[a-zA-Z0-9\p{L}!#$%&'*+/=?^_`{|\}~äöüßàâäçéèêëîïôöùûüÿæœ-]"""
  private val simpleCharacter_2        = """[a-zA-Z\p{L}!#$%&'*+/=?^_`{|\}~äöüßàâäçéèêëîïôöùûüÿæœ-]"""
  private val allCharacters            = """[a-zA-Z0-9\p{L};(),<:>.!@#$%&'*+/=?^_`{|\}~[\\]äöüßàâäçéèêëîïôöùûüÿæœ-]"""
  private val labelOfLocalPart         = s"""(?:$simpleCharacter{1,64})"""
  private val labelOfDomainPart        = s"""($simpleCharacter_2{1,63})"""
  private val stringBetweenParentheses = s"""(\\((?:$allCharacters{1,63})\\))?"""
  private val quotedString             = """(?>\"(.*)\")?"""
  private val localPart                =
    s"""(?>((\\s)|(($quotedString$stringBetweenParentheses$labelOfLocalPart$stringBetweenParentheses$quotedString$quotedString)|(?>\"(.*)\"))(?:\\.$stringBetweenParentheses$labelOfLocalPart$quotedString$stringBetweenParentheses$quotedString)*))""".stripMargin
  private val lastLabel                = """[a-zA-Z]{2,3}"""
  private val subDomainPart_1          = s"""$labelOfDomainPart(?:$labelOfDomainPart)*"""
  private val subDomainPart_2          = s"""$lastLabel"""
  private val domainPart               = s"""$subDomainPart_1[\\.]$subDomainPart_2$$"""
  private val FormatPattern: Regex     = s"""$localPart@$domainPart$$""".r
  private val lengthPattern: Regex     = """^.{5,255}$""".r
  private val patterns                 = List(lengthPattern, FormatPattern)
  def isValid(email: String): Boolean  = patterns.forall { pattern =>
    email match {
      case pattern(_*) => true
      case _           => false
    }
  }
}
