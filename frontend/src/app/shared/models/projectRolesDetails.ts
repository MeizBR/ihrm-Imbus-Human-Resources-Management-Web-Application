import { ProjectRoles } from '../../generated/projectRoles';

export interface ProjectRolesDetails {
  userId: number;
  roles: string[];
}

export interface ProjectRolesByProject {
  projectId: number;
  roles: ProjectRolesDetails[];
}

export function mapProjectRolesToProjectRolesDetails(data: ProjectRoles): ProjectRolesDetails {
  return {
    userId: data.userId,
    roles: data.roles,
  };
}
