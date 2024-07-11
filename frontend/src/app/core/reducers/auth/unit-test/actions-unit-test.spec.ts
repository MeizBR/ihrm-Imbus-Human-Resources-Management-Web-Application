import { ActionTypes, authActions } from '../auth.actions';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { UserSessionDetails } from '../../../../shared/models/user-models/user-session-data';
import { ErrorType } from '../../../../shared/validators/validation-error-type';

describe('Auth actions', () => {
  describe('Login actions', () => {
    const user = {
      workspace: 'imbus',
      login: 'admin',
      password: 'adminPass',
    };
    it('should create loginAction action', () => {
      const action = authActions.loginAction({
        user,
      });
      expect(action).toEqual({ user, type: ActionTypes.LOGIN });
    });

    it('should create loginSuccessAction action', () => {
      const userSession: UserSessionDetails = {
        workspaceId: 1,
        userId: 1,
        fullName: 'user',
        token: 'ABCD',
        globalRoles: [RoleModel.Administrator],
      };
      const action = authActions.loginSuccessAction({ user: userSession });

      expect(action).toEqual({ user: userSession, type: ActionTypes.LOGIN_SUCCESS });
    });

    it('should create loginFailedAction action', () => {
      const action = authActions.loginFailedAction({ errorType: ErrorType.EmailExists });

      expect(action).toEqual({ errorType: ErrorType.EmailExists, type: ActionTypes.LOGIN_FAILED });
    });
  });

  describe('Logout actions', () => {
    it('should create logoutAction action', () => {
      const action = authActions.logoutAction();
      expect(action).toEqual({ type: ActionTypes.LOGOUT });
    });

    it('should create logoutSuccessAction action', () => {
      const action = authActions.logoutSuccessAction();

      expect(action).toEqual({ type: ActionTypes.LOGOUT_SUCCESS });
    });

    it('should create logoutFailedAction action', () => {
      const action = authActions.logoutFailedAction();

      expect(action).toEqual({ type: ActionTypes.LOGOUT_FAILED });
    });
  });

  describe('Restore user session actions', () => {
    it('should create RestoreUserSessionAction action', () => {
      const action = authActions.RestoreUserSessionAction({ workspaceId: 1 });

      expect(action).toEqual({
        workspaceId: 1,
        type: ActionTypes.RESTORE_USER_SESSION,
      });
    });

    it('should create RestoreUserSessionSuccessAction action', () => {
      const sessionDetails: UserSessionDetails = {
        workspaceId: 1,
        userId: 1,
        fullName: 'user',
        token: 'ABCD',
        globalRoles: [RoleModel.Administrator],
      };
      const action = authActions.RestoreUserSessionSuccessAction({ sessionDetails });

      expect(action).toEqual({ sessionDetails, type: ActionTypes.RESTORE_USER_SESSION_SUCCESS });
    });

    it('should create RestoreUserSessionFailedAction action', () => {
      const action = authActions.RestoreUserSessionFailedAction();

      expect(action).toEqual({ type: ActionTypes.RESTORE_USER_SESSION_FAILED });
    });
  });

  describe('Reset session actions', () => {
    it('should create ResetSessionAction action', () => {
      const action = authActions.ResetSessionAction();

      expect(action).toEqual({ type: ActionTypes.RESET_SESSION });
    });
  });
});
