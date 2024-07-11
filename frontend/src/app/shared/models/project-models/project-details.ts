import { Roles } from '../role';

import { isActionPermitted } from '../element-role';

import { Project } from '../../../generated/project';

import { ProjectPermissions } from '../../enum/actions.enum';

export interface ProjectDetails {
  id: number;
  customerId?: number;
  customer?: string;
  name: string;
  description: string;
  // NOTE: it's made optional to ignore form error in project helper
  // To be changed when we implement note in the form (when we need to post or patch note)
  note?: string;
  isActive: boolean;
  userRoles?: string[];
}

export interface UserProjects {
  userId: number;
  projects: ProjectDetails[];
}
export interface RolesDetails {
  project: number;
  data: Roles[];
}

export interface ProjectDetailedPermissions {
  id: number;
  customerId?: number;
  customer?: string;
  isActiveCustomer?: boolean;
  name: string;
  description: string;
  note: string;
  isActive: boolean;
  userRoles?: string[];
  userPermissions: UserPermissions;
}

interface UserPermissions {
  canEdit: boolean;
  seeRoles: boolean;
  canDelete: boolean;
  canEditRole: boolean;
}

export function mapProjectToProjectDetails(data: Project): ProjectDetails {
  return {
    id: data.id,
    customerId: data.customerId,
    name: data.name,
    description: data.description,
    note: data.note,
    isActive: data.isActive,
  };
}

export function mapProjectToDetailedProjectPermissions(data: ProjectDetails, globalRole: string[]): ProjectDetailedPermissions {
  return {
    id: data.id,
    customerId: data.customerId,
    name: data.name,
    description: data.description,
    note: data.note,
    isActive: data.isActive,
    userRoles: data.userRoles,
    userPermissions: {
      canEdit: isActionPermitted(ProjectPermissions.EditProject, globalRole && globalRole.concat(data.userRoles)),
      seeRoles: isActionPermitted(ProjectPermissions.ShowProjectRole, globalRole && globalRole.concat(data.userRoles)),
      canDelete: isActionPermitted(ProjectPermissions.DeleteProject, globalRole && globalRole.concat(data.userRoles)),
      canEditRole: isActionPermitted(ProjectPermissions.EditProjectRole, globalRole && globalRole.concat(data.userRoles)),
    },
  };
}
