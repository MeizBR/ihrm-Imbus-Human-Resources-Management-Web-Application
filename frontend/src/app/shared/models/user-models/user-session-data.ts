import { RoleModel } from '../../enum/role-model.enum';
import { UserSession } from '../../../generated/models';

export interface UserSessionDetails {
  workspaceId: number;
  userId: number;
  fullName: string;
  token: string;
  globalRoles: RoleModel[];
}

export function mapToUserSessionDetails(us: UserSession): UserSessionDetails {
  return {
    workspaceId: us.workspaceId,
    userId: us.userId,
    fullName: us.fullName,
    token: us.token,
    globalRoles: us.globalRoles.map(r => RoleModel.fromApiValue(r)),
  };
}
