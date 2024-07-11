import { RoleModel } from '../enum/role-model.enum';
import { CustomerPermissions, ProjectPermissions, UserPermissions } from '../enum/actions.enum';

export interface ActionRole {
  action: UserPermissions | CustomerPermissions | ProjectPermissions;
  requiredRoles: string[];
}

const userActionRoles: ActionRole[] = [
  { action: UserPermissions.AddUser, requiredRoles: [RoleModel.Administrator] },
  { action: UserPermissions.EditUser, requiredRoles: [RoleModel.Administrator] },
  { action: UserPermissions.DeleteUser, requiredRoles: [RoleModel.Administrator] },
];

const customerActionRoles: ActionRole[] = [
  { action: CustomerPermissions.AddCustomer, requiredRoles: [RoleModel.Administrator] },
  { action: CustomerPermissions.EditCustomer, requiredRoles: [RoleModel.Administrator] },
  { action: CustomerPermissions.DeleteCustomer, requiredRoles: [RoleModel.Administrator] },
];

const projectActionRoles: ActionRole[] = [
  { action: ProjectPermissions.AddProject, requiredRoles: [RoleModel.Administrator] },
  { action: ProjectPermissions.EditProject, requiredRoles: [RoleModel.Administrator, RoleModel.Lead, RoleModel.Supervisor] },
  { action: ProjectPermissions.DeleteProject, requiredRoles: [RoleModel.Administrator] },
  { action: ProjectPermissions.ShowProjectRole, requiredRoles: [RoleModel.Administrator, RoleModel.Lead, RoleModel.Supervisor, RoleModel.Member] },
  { action: ProjectPermissions.EditProjectRole, requiredRoles: [RoleModel.Administrator, RoleModel.Lead] },
];

export const globalActionPermitted = function (action: UserPermissions | CustomerPermissions | ProjectPermissions, role: string[], moduleName: string): boolean {
  let actionRole: ActionRole;

  switch (moduleName) {
    case 'user': {
      actionRole = userActionRoles.find((actRole: ActionRole) => actRole.action === action);
      break;
    }
    case 'customer': {
      actionRole = customerActionRoles.find((actRole: ActionRole) => actRole.action === action);

      break;
    }
    case 'project': {
      actionRole = projectActionRoles.find((actRole: ActionRole) => actRole.action === action);

      break;
    }
    default: {
      break;
    }
  }

  if (actionRole === undefined || actionRole === null) {
    return false;
  }

  return !!actionRole.requiredRoles.find((requiredRole: RoleModel) => role && role.find(r => requiredRole === r));
};

export const isActionPermitted = function (action: UserPermissions | CustomerPermissions | ProjectPermissions, roles: string[]): boolean {
  return (
    roles &&
    roles.some(role =>
      userActionRoles
        .concat(customerActionRoles)
        .concat(projectActionRoles)
        .find(act => act.action === action)
        ?.requiredRoles.includes(role as RoleModel),
    )
  );
};
