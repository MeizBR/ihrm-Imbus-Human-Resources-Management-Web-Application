import { AuthState } from '../auth.reducer';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { UserSessionDetails } from '../../../../shared/models/user-models/user-session-data';
import { isAdminGlobalRole, loggedUserId, selectGlobalRoles, selectIsRestoreCompleted, selectUserSession, selectUserWorkspaceId } from '..';

describe('Auth state', () => {
  const session: UserSessionDetails = {
    workspaceId: 1,
    userId: 1,
    fullName: 'user',
    token: 'ABCD',
    globalRoles: [RoleModel.Administrator],
  };

  const initialAuthState: AuthState = {
    userSession: null,
    error: undefined,
    completed: true,
  };

  it('Should select the user session', () => {
    let result = selectUserSession.projector(initialAuthState);
    expect(result).toEqual(null);

    result = selectUserSession.projector({ initialAuthState, userSession: session });
    expect(result).toEqual(session);
  });

  it('Should select the user workspace id', () => {
    let result = selectUserWorkspaceId.projector(null);
    expect(result).toEqual(null);

    result = selectUserWorkspaceId.projector(session);

    expect(result).toEqual(1);
  });

  it('Should select the global roles of the connected user', () => {
    let result = selectGlobalRoles.projector(initialAuthState);
    expect(result).toEqual(undefined);

    result = selectGlobalRoles.projector(session);
    expect(result).toEqual([RoleModel.Administrator]);
  });

  it('Should select if restore session is completed', () => {
    let result = selectIsRestoreCompleted.projector({
      completed: true,
      userSession: null,
    });
    expect(result).toEqual(true);

    result = selectIsRestoreCompleted.projector({ ...initialAuthState, completed: false });
    expect(result).toEqual(false);
  });

  it('Should select if the connected user has the admin global roles', () => {
    let result = isAdminGlobalRole.projector([]);
    expect(result).toEqual(false);

    result = isAdminGlobalRole.projector([RoleModel.Administrator]);
    expect(result).toEqual(true);
  });

  it('Should select the id of connected user', () => {
    let result = loggedUserId.projector(initialAuthState);
    expect(result).toEqual(undefined);

    result = loggedUserId.projector(session);
    expect(result).toEqual(1);
  });
});
