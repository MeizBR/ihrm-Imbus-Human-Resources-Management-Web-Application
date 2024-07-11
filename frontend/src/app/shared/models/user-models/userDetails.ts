import { User } from '../../../generated/user';

import { isActionPermitted } from '../element-role';

import { RoleModel } from '../../enum/role-model.enum';
import { UserPermissions as UserActionPermissions } from '../../enum/actions.enum';

export interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  email: string;
  note: string;
  registrationNumber?: number; // NOTE: this attribute will be required after merging the backend task 101
  isActive: boolean;
  fullName?: string;
  globalRoles?: RoleModel[];
}

export interface UserGLobalRoles {
  id: number;
  globalRoles: RoleModel[];
}

export interface UserDetailedPermissions {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  email: string;
  note: string;
  registrationNumber?: number; // NOTE: this attribute will be required after merging the backend task 101
  isActive: boolean;
  fullName?: string;
  globalRoles?: RoleModel[];
  userPermissions: UserPermissions;
}

interface UserPermissions {
  canEdit: boolean;
  seeRoles: boolean;
  canDelete: boolean;
}

export function mapUserToUserDetails(data: User): UserDetails {
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    login: data.login,
    email: data.email,
    note: data.note,
    registrationNumber: 1500, // NOTE: To be removed after implementing the backend
    isActive: data.isActive,
  };
}

export function mapUserToUserDetailedPermissions(user: UserDetails, globalRole: string[], connectedUser: number): UserDetailedPermissions {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    login: user.login,
    email: user.email,
    note: user.note,
    registrationNumber: user.registrationNumber,
    isActive: user.isActive,
    fullName: user.firstName.concat(' ', user.lastName),
    globalRoles: user.globalRoles,
    userPermissions: {
      canEdit: isActionPermitted(UserActionPermissions.EditUser, globalRole) || connectedUser === user.id,
      seeRoles: false,
      canDelete: user.id !== connectedUser && isActionPermitted(UserActionPermissions.DeleteUser, globalRole),
    },
  };
}
