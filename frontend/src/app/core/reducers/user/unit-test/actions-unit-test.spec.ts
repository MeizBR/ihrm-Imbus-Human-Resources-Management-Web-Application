import { ActionTypes, usersActions } from '../../../reducers/user/user.actions';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { UserDetails, UserForAdd, UserForUpdate } from '../../../../shared/models/user-models/user-models-index';

describe('User actions', () => {
  const userDetails: UserDetails = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    login: 'admin',
    email: 'admin@gmail.com',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: true,
  };

  describe('Load users actions', () => {
    it('should create loadUsersAction action', () => {
      const action = usersActions.loadUsersAction();
      expect(action).toEqual({ type: ActionTypes.LOAD_USERS });
    });

    it('should create loadUsersSuccessAction action', () => {
      const payload = [userDetails];
      const action = usersActions.loadUsersSuccessAction({ usersList: payload });

      expect(action).toEqual({ usersList: payload, type: ActionTypes.LOAD_USERS_SUCCESS });
    });
  });

  describe('Add user actions', () => {
    it('should create addUserAction action', () => {
      const payload: UserForAdd = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'admin',
        email: 'admin@gmail.com',
        note: 'the user note',
        registrationNumber: 1500,
        password: 'admin',
        isActive: true,
      };
      const action = usersActions.addUserAction({ user: payload });
      expect(action).toEqual({ user: payload, type: ActionTypes.ADD_USER });
    });

    it('should create addUserSuccessAction action', () => {
      const payload = userDetails;
      const action = usersActions.addUserSuccessAction({ user: payload });

      expect(action).toEqual({ user: payload, type: ActionTypes.ADD_USER_SUCCESS });
    });
  });

  describe('Update user actions', () => {
    const user: UserForUpdate = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      login: 'admin',
      email: 'admin@gmail.com',
      password: {
        connectedPassword: 'adminPass',
        newPassword: 'newPass',
      },
      note: 'the user note',
      isActive: true,
    };
    it('should create updateUserAction action', () => {
      const action = usersActions.updateUserAction({ user });

      expect(action).toEqual({
        user,
        type: ActionTypes.UPDATE_USER,
      });
    });

    it('should create updateUserSuccessAction action', () => {
      const action = usersActions.updateUserSuccessAction({ user: userDetails });

      expect(action).toEqual({ user: userDetails, type: ActionTypes.UPDATE_USER_SUCCESS });
    });
  });

  describe('Delete user actions', () => {
    it('should create deleteUserAction action', () => {
      const action = usersActions.deleteUserAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_USER });
    });

    it('should create deleteUserSuccessAction action', () => {
      const action = usersActions.deleteUserSuccessAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_USER_SUCCESS });
    });
  });

  describe('User management actions', () => {
    it('should create userManagementFailAction action', () => {
      const action = usersActions.userManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.LoginExists });
      expect(action.type).toEqual(ActionTypes.USER_MANAGEMENT_FAIL);
    });
  });
});
