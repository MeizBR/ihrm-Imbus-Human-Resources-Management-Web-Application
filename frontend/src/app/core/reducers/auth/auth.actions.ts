import { createAction, props } from '@ngrx/store';

import { PostUserSession } from './../../../generated/postUserSession';
import { UserSessionDetails } from './../../../shared/models/user-models/user-session-data';

import { ErrorType } from '../../../shared/validators/validation-error-type';

export enum ActionTypes {
  LOGIN = '[loginReducer] login to the application',
  LOGIN_SUCCESS = '[loginReducer] login success to the application',
  LOGIN_FAILED = '[loginReducer] login failed to the application',
  LOGOUT = '[loginReducer] logout from application',
  LOGOUT_SUCCESS = '[loginReducer] logout success from application',
  LOGOUT_FAILED = '[loginReducer] logout failed from application',
  RESTORE_USER_SESSION = '[loginReducer] Restore user session',
  RESTORE_USER_SESSION_SUCCESS = '[loginReducer] Restore user session success',
  RESTORE_USER_SESSION_FAILED = '[loginReducer] Restore user session failed',
  LOAD_USER_FROM_LOCAL_STORAGE = '[loginReducer] to load user data from localStorage',
  RESET_SESSION = '[loginReducer] Reset session',
}
export const authActions = {
  loginAction: createAction(ActionTypes.LOGIN, props<{ user: PostUserSession }>()),
  loginSuccessAction: createAction(ActionTypes.LOGIN_SUCCESS, props<{ user: UserSessionDetails }>()),
  loginFailedAction: createAction(ActionTypes.LOGIN_FAILED, props<{ errorType: ErrorType }>()),
  logoutAction: createAction(ActionTypes.LOGOUT),
  logoutSuccessAction: createAction(ActionTypes.LOGOUT_SUCCESS),
  logoutFailedAction: createAction(ActionTypes.LOGOUT_FAILED),
  RestoreUserSessionAction: createAction(ActionTypes.RESTORE_USER_SESSION, props<{ workspaceId: number }>()),
  RestoreUserSessionSuccessAction: createAction(ActionTypes.RESTORE_USER_SESSION_SUCCESS, props<{ sessionDetails: UserSessionDetails }>()),
  RestoreUserSessionFailedAction: createAction(ActionTypes.RESTORE_USER_SESSION_FAILED),
  ResetSessionAction: createAction(ActionTypes.RESET_SESSION),
};
