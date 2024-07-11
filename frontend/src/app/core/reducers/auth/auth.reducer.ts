import { Action, createReducer, on } from '@ngrx/store';

import { authActions } from './auth.actions';

import { UserSessionDetails } from '../../../shared/models/user-models/user-session-data';

import { ErrorType } from '../../../shared/validators/validation-error-type';

export const authReducerKey = 'authReducer';

export interface AuthState {
  completed: boolean;
  userSession: UserSessionDetails;
  error: ErrorType | undefined;
}

export const initialState: AuthState = {
  completed: true,
  userSession: null,
  error: undefined,
};

const authenticationReducer = createReducer(
  initialState,
  on(authActions.loginSuccessAction, (state, payload): AuthState => ({ ...state, userSession: payload.user })),
  on(
    authActions.loginFailedAction,
    (state, payload): AuthState => {
      return { ...state, error: payload.errorType };
    },
  ),
  on(authActions.logoutSuccessAction, (_): AuthState => ({ ...initialState })),
  on(authActions.ResetSessionAction, (_): AuthState => ({ ...initialState })),
  on(authActions.RestoreUserSessionAction, (state): AuthState => ({ ...state, completed: false })),
  on(authActions.RestoreUserSessionSuccessAction, (state, payload): AuthState => ({ ...state, completed: true, userSession: payload.sessionDetails })),
  on(authActions.RestoreUserSessionFailedAction, (state): AuthState => ({ ...state, completed: true })),
);

export function reducer(state: AuthState | undefined, action: Action): AuthState {
  return authenticationReducer(state, action);
}
