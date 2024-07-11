name := "scala template"
version := "1.1"
scalaVersion in ThisBuild := "2.12.9"
libraryDependencies += "io.swagger.codegen.v3" % "swagger-codegen" % "3.0.9"

// Note: The warning "Supported source version 'RELEASE_5' from annotation processor 'ch.qos.cal10n.verifier.processor.CAL10NAnnotationProcessor' less than -source '1.8'"
// is caused by CAL10NAnnotationProcessor from "cal10n-api", see http://jira.qos.ch/browse/CAL-47
// The "cal10n-api" is a dependency of swagger-codegen.
// This warning is harmless.

// Note: The warning, that AbstractScalaCodegen uses unchecked or unsafe operations is caused by
// the generated java code that is used "as is". The warning is harmless.
