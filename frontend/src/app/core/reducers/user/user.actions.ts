import { createAction, props } from '@ngrx/store';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { UserDetails, UserForAdd, UserForUpdate, UserGLobalRoles } from '../../../shared/models/user-models/user-models-index';

export enum ActionTypes {
  /** Users management actions types */
  LOAD_USERS = '[userManagement] Load Users',
  LOAD_USERS_SUCCESS = '[userManagement] Load Users Success',

  LOAD_USER_GLOBAL_ROLES_SUCCESS = '[userManagement] Load User Global Roles Success',

  ADD_USER = '[userManagement] Add user',
  ADD_USER_SUCCESS = '[userManagement] Add User Success',

  UPDATE_USER = '[userManagement] Update User',
  UPDATE_USER_SUCCESS = '[userManagement] Update User Success',

  PUT_USER_ROLES = '[userManagement] Put User Role',
  PUT_USER_ROLES_SUCCESS = '[userManagement] Put User Role Success',

  DELETE_USER = '[userManagement] Delete User',
  DELETE_USER_SUCCESS = '[userManagement] Delete User Success',

  USER_MANAGEMENT_FAIL = '[userManagement] User Management Failed',

  /** Reset users state action types*/
  RESET_USERS_STATE = '[userManagement] Reset State',
}

export const usersActions = {
  /** Users management actions */
  loadUsersAction: createAction(ActionTypes.LOAD_USERS),
  loadUsersSuccessAction: createAction(ActionTypes.LOAD_USERS_SUCCESS, props<{ usersList: UserDetails[] }>()),

  loadUserGlobalRolesSuccessAction: createAction(ActionTypes.LOAD_USER_GLOBAL_ROLES_SUCCESS, props<{ usersGlobalRoles: UserGLobalRoles[] }>()),

  addUserAction: createAction(ActionTypes.ADD_USER, props<{ user: UserForAdd }>()),
  addUserSuccessAction: createAction(ActionTypes.ADD_USER_SUCCESS, props<{ user: UserDetails }>()),

  updateUserAction: createAction(ActionTypes.UPDATE_USER, props<{ user: UserForUpdate }>()),
  updateUserSuccessAction: createAction(ActionTypes.UPDATE_USER_SUCCESS, props<{ user: UserDetails }>()),

  putUserRoleAction: createAction(ActionTypes.PUT_USER_ROLES, props<{ id: number; roles: string[] }>()),
  putUserRoleSuccessAction: createAction(ActionTypes.PUT_USER_ROLES_SUCCESS, props<{ id: number; roles: RoleModel[] }>()),

  deleteUserAction: createAction(ActionTypes.DELETE_USER, props<{ id: number }>()),
  deleteUserSuccessAction: createAction(ActionTypes.DELETE_USER_SUCCESS, props<{ id: number }>()),

  userManagementFailAction: createAction(ActionTypes.USER_MANAGEMENT_FAIL, props<{ withSnackBarNotification: boolean; errorType: ErrorType }>()),

  /** Reset users state actions*/
  ResetUsersStateAction: createAction(ActionTypes.RESET_USERS_STATE),
};
