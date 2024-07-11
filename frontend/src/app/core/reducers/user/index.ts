import { createSelector } from '@ngrx/store';

import { AppState } from '../index';

import * as usersReducer from './user.reducer';
import { selectGlobalRoles, selectUserSession } from '../auth';

import { UserPermissions } from '../../../shared/enum/actions.enum';
import { mapUserToUserDetailedPermissions } from '../../../shared/models';
import { globalActionPermitted } from '../../../shared/models/element-role';

export const selectFeature = (state: AppState) => state[usersReducer.usersReducerKey];
export const getUsersError = createSelector(selectFeature, state => state.error);
export const getUsersLoading = createSelector(selectFeature, state => state.loadingAction);
export const selectUsersList = createSelector(selectFeature, state => state.usersList);

export const selectAddUserPermission = createSelector(selectGlobalRoles, role => globalActionPermitted(UserPermissions.AddUser, role, 'user'));

export const usersListDetailed = createSelector(selectUsersList, selectGlobalRoles, selectUserSession, (usersList, globalRoles, userSession) => {
  return usersList?.map(userDetails => mapUserToUserDetailedPermissions(userDetails, globalRoles, userSession?.userId)) || [];
});

export const mappedUsersList = createSelector(usersListDetailed, usersList =>
  usersList?.map(userDetails =>
    usersList?.filter(user => user.id !== userDetails.id).some(val => val.fullName === userDetails.fullName)
      ? { ...userDetails, fullName: userDetails.fullName.concat(' (', userDetails.login, ')') }
      : userDetails,
  ),
);

export const mappedActiveUsersList = createSelector(mappedUsersList, usersList => usersList?.filter(user => user.isActive));
