/**
 * RESTful API of iHRM
 *
 * This class is auto generated, see api/templates and
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
package api.generated.projects

import api.enumeration.ProjectRole
import api.enumeration._


case class ProjectRoles(
  userId: Int,
  roles: List[ProjectRole]
)

object ProjectRoles {
  given  decoder: io.circe.Decoder[ProjectRoles] = io.circe.generic.semiauto.deriveDecoder
  given  encoder: io.circe.Encoder[ProjectRoles] = io.circe.generic.semiauto.deriveEncoder
}

