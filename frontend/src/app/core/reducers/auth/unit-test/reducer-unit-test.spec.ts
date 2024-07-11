import { authActions } from '../auth.actions';
import * as fromReducer from '../auth.reducer';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { UserSessionDetails } from '../../../../shared/models/user-models/user-session-data';

describe('Auth reducer', () => {
  const user: UserSessionDetails = {
    workspaceId: 1,
    userId: 1,
    fullName: 'user',
    token: 'ABCD',
    globalRoles: [RoleModel.Administrator],
  };

  describe('An unknown action', () => {
    it('should return the default state', () => {
      const state = fromReducer.reducer(fromReducer.initialState, { type: undefined });

      expect(state).toBe(fromReducer.initialState);
    });
  });

  describe('Dispatch actions', () => {
    it('should connect and update the state in an immutable way', () => {
      const newState: fromReducer.AuthState = { userSession: user, completed: true, error: undefined };
      const state = fromReducer.reducer(fromReducer.initialState, authActions.loginSuccessAction({ user }));

      expect(state).toEqual(newState);
    });

    it('should Sign out and update the state in an immutable way', () => {
      const state = fromReducer.reducer({ userSession: user, completed: true, error: undefined }, authActions.logoutSuccessAction());
      expect(state).toEqual(fromReducer.initialState);
    });

    it('should reset the state in an immutable way', () => {
      const state = fromReducer.reducer({ userSession: user, completed: true, error: undefined }, authActions.ResetSessionAction());
      expect(state).toEqual(fromReducer.initialState);
    });

    it('should restore the session and update the state in an immutable way', () => {
      const initialState = { userSession: null, completed: true, error: undefined };

      let expectedState: fromReducer.AuthState = { userSession: null, completed: false, error: undefined };
      let state = fromReducer.reducer(initialState, authActions.RestoreUserSessionAction({ workspaceId: 1 }));

      expect(state).toEqual(expectedState);

      expectedState = { userSession: user, completed: true, error: undefined };
      state = fromReducer.reducer(initialState, authActions.RestoreUserSessionSuccessAction({ sessionDetails: user }));

      expect(state).toEqual(expectedState);
      state = fromReducer.reducer(initialState, authActions.RestoreUserSessionFailedAction());

      expect(state).toEqual(initialState);
    });
  });
});
