// build.sbt

name := "ihrm"

ThisBuild / scalaVersion := "3.3.3"
ThisBuild / version := "1.0.0"
ThisBuild / scalacOptions ++= Seq(
  "-deprecation",
  "-feature",
  "-unchecked"
)

val akkaVersion         = "2.6.6"
val pekkoVersion        = "1.0.1"
val slickVersion        = "3.5.0"
val circeVersion        = "0.14.6"
val enumeratumVersion   = "1.7.3"
val specs2CoreVersion   = "4.20.5"
val slf4jVersion        = "2.0.12"
val akkaHttpCorsVersion = "0.4.3"
val mysqlVersion        = "8.0.33"
val postgresqlVersion   = "42.7.2"

libraryDependencies ++= Seq(
  "org.apache.pekko"   %% "pekko-http"           % pekkoVersion,
  "org.apache.pekko"   %% "pekko-actor"          % pekkoVersion,
  "org.apache.pekko"   %% "pekko-stream"         % pekkoVersion,
  "org.apache.pekko"   %% "pekko-slf4j"          % pekkoVersion,
  "org.apache.pekko"   %% "pekko-stream-testkit" % pekkoVersion,
  "org.apache.pekko"   %% "pekko-http-cors"      % pekkoVersion,
  "com.typesafe.slick" %% "slick"                % slickVersion,
  "com.typesafe.slick" %% "slick-hikaricp"       % slickVersion,
  "org.slf4j"          % "slf4j-api"             % slf4jVersion,
  "org.slf4j"          % "slf4j-simple"          % slf4jVersion,
  "io.circe"           %% "circe-generic"        % circeVersion,
  "io.circe"           %% "circe-core"           % circeVersion,
  "io.circe"           %% "circe-parser"         % circeVersion,
  "org.specs2"         %% "specs2-core"          % specs2CoreVersion % Test,
  "mysql"              % "mysql-connector-java"  % mysqlVersion,
  "com.sun.mail"          % "javax.mail"           % "1.6.2",
  "org.postgresql"     % "postgresql"            % postgresqlVersion,
  "com.beachape"       %% "enumeratum"           % enumeratumVersion,
  "com.beachape"       %% "enumeratum-circe"     % enumeratumVersion
)

ThisBuild / scalafmtOnCompile := !sys.env.contains("skipScalaFmt")
Test / parallelExecution := false

lazy val ihrm = (project in file(".")).settings(
  Compile / run / mainClass := Some("ihrm.Server")
)

lazy val collectJars = taskKey[Unit]("Collects required JARs.")
collectJars := {
  val jars = (Runtime / fullClasspathAsJars).value.map(_.data)
  require(jars.map(_.getName).toSet.size == jars.size, "Duplicate JAR file name in $jars")
  val jarsDir = baseDirectory.value / "target" / "universal" / "jars"
  IO.delete(jarsDir)
  jars.foreach(file => IO.copyFile(file, jarsDir / file.name))
}

Test / fork := true

lazy val resetDatabase = taskKey[Unit]("Resets the database")
resetDatabase := {
  (Compile / runMain).toTask(" db.ResetDatabase").value
}
