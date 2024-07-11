import { Action, createReducer, on } from '@ngrx/store';
import { usersActions } from './user.actions';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { UserDetails } from '../../../shared/models/user-models/user-models-index';
export const usersReducerKey = 'usersReducer';

export interface UsersState {
  usersList: UserDetails[] | undefined;
  error: ErrorType | undefined;
  loadingAction: boolean | undefined;
}

export const initialUsersState: UsersState = {
  usersList: undefined,
  error: undefined,
  loadingAction: false,
};

const usersReducer = createReducer(
  initialUsersState,
  on(
    usersActions.loadUsersSuccessAction,
    (state, payload): UsersState => {
      return { ...state, error: undefined, usersList: payload.usersList };
    },
  ),

  on(
    usersActions.loadUserGlobalRolesSuccessAction,
    (state, payload): UsersState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        usersList: state.usersList
          ? [
              ...state.usersList?.map(user => {
                return payload.usersGlobalRoles.find(userRoles => userRoles.id === user.id)
                  ? { ...user, globalRoles: payload.usersGlobalRoles.find(roles => roles.id === user.id).globalRoles }
                  : user;
              }),
            ]
          : state.usersList,
      };
    },
  ),

  on(
    usersActions.addUserAction,
    (state, _): UsersState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    usersActions.addUserSuccessAction,
    (state, payload): UsersState => {
      return { ...state, error: undefined, loadingAction: false, usersList: state.usersList ? [...state.usersList, payload.user] : [payload.user] };
    },
  ),

  on(
    usersActions.updateUserAction,
    (state, _): UsersState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    usersActions.updateUserSuccessAction,
    (state, payload): UsersState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        usersList: [...state.usersList.map(user => (user?.id === payload?.user?.id ? { ...payload.user, globalRoles: user.globalRoles } : user))],
      };
    },
  ),

  on(
    usersActions.putUserRoleSuccessAction,
    (state, payload): UsersState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        usersList: [...state.usersList.map(user => (user?.id === payload?.id ? { ...user, globalRoles: payload?.roles } : user))],
      };
    },
  ),

  on(
    usersActions.deleteUserAction,
    (state, _): UsersState => {
      return { ...state, error: undefined };
    },
  ),

  on(
    usersActions.deleteUserSuccessAction,
    (state, payload): UsersState => {
      return { ...state, error: undefined, usersList: state.usersList ? [...state.usersList.filter(user => user.id !== payload.id)] : state.usersList };
    },
  ),

  on(
    usersActions.userManagementFailAction,
    (state, payload): UsersState => {
      return { ...state, error: payload.errorType, loadingAction: false };
    },
  ),

  on(
    usersActions.ResetUsersStateAction,
    (): UsersState => {
      return { ...initialUsersState };
    },
  ),
);

export function reducer(state: UsersState | undefined, action: Action): UsersState {
  return usersReducer(state, action);
}
