import { createSelector } from '@ngrx/store';

import * as authState from '../auth/auth.reducer';

import { AppState } from '..';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { UserSessionDetails } from '../../../shared/models/user-models/user-session-data';

export const selectFeature = (state: AppState) => state[authState.authReducerKey];
export const selectUserSession = createSelector(selectFeature, state => state.userSession);
export const selectUserWorkspaceId = createSelector(selectUserSession, userSession => userSession && userSession.workspaceId);
export const selectGlobalRoles = createSelector(selectUserSession, (userSession: UserSessionDetails) => userSession && userSession.globalRoles);
export const selectIsRestoreCompleted = createSelector(selectFeature, state => state.completed);
export const getAuthenticationError = createSelector(selectFeature, state => state.error);
export const isAdminGlobalRole = createSelector(selectGlobalRoles, (roles: RoleModel[]) => roles && roles?.includes(RoleModel.Administrator));

export const loggedUserId = createSelector(selectUserSession, userSession => userSession && userSession.userId);
