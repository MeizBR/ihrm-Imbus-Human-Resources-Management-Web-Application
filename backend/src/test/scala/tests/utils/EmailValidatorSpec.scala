package tests.utils

import org.specs2.Specification
import utils.EmailValidator

object EmailValidatorSpec extends Specification {
  def is = "Email format validation".title ^ sequential ^ s2"""
      the following emails should be valid:
        customer/department=shipping@example.com  ${s1("customer/department=shipping@example.com")}
        A12345@example.com                        ${s1("A12345@example.com")}
        !def!xyz%abc@example.com                  ${s1("!def!xyz%abc@example.com")}
        _somename@example.com                     ${s1("_somename@example.com")}
        disposable.style.email.with+symbol@example.com ${s1("disposable.style.email.with+symbol@example.com")}
        "Abc@def"@example.com                ${s1("\"Abc@def\"@example.com")}
        "Imbus Tunisia"@example.com            ${s1("\"Imbus Tunisia\"@example.com")}

      the following email should not be valid:
        Abc\\@def@example.com                  ${s2("Abc\\@def@example.com")}
        Imbus\\ Tunisia@example.com              ${s2("Imbus\\ Tunisia@example.com")}
        Joe.\\Blow@example.com                 ${s2("Joe.\\Blow@example.com")}
        Abc.example.com                        ${s2("Abc.example.com")}
        A@b@c@example.com                      ${s2("A@b@c@example.com")}
        a\"b(c)d,e:f;g<h>i[j\\k]l@example.com  ${s2("a\"b(c)d,e:f;g<h>i[j\\k]l@example.com")}
        ust\"not\"right@example.com            ${s2("ust\"not\"right@example.com ")}
  """"

  def s1(mail: String) = EmailValidator.isValid(mail) shouldEqual true

  def s2(mail: String) = EmailValidator.isValid(mail) shouldEqual false

}
