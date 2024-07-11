import * as fromReducer from '../user.reducer';
import { usersActions } from '../user.actions';

import { UserDetails } from '../../../../shared/models';

describe('User reducer', () => {
  const johnDoe: UserDetails = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    login: 'admin',
    email: 'admin@gmail.com',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: true,
    globalRoles: [],
  };
  const jackieJoe: UserDetails = {
    id: 2,
    firstName: 'Jackie',
    lastName: 'Joe',
    login: 'lead',
    email: 'lead@gmail.com',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: false,
    globalRoles: [],
  };
  const initialUsersState: fromReducer.UsersState = { usersList: [johnDoe], error: undefined, loadingAction: false };

  describe('An unknown action', () => {
    it('should return the default state', () => {
      const state = fromReducer.reducer(fromReducer.initialUsersState, { type: undefined });

      expect(state).toBe(fromReducer.initialUsersState);
    });
  });

  describe('Dispatch actions', () => {
    it('should load all users and update the state in an immutable way', () => {
      const usersList = [johnDoe, jackieJoe];
      const newState: fromReducer.UsersState = { usersList: usersList, error: undefined, loadingAction: false };
      const state = fromReducer.reducer(fromReducer.initialUsersState, usersActions.loadUsersSuccessAction({ usersList: usersList }));

      expect(state).toEqual(newState);
    });

    it('should add new user and update the state in an immutable way', () => {
      const state = fromReducer.reducer(fromReducer.initialUsersState, usersActions.addUserSuccessAction({ user: johnDoe }));
      expect(state).toEqual(initialUsersState);
    });

    it('should update an existing user and update the state in an immutable way', () => {
      let state = fromReducer.reducer(initialUsersState, { type: undefined });
      const updatedUser = { ...johnDoe, login: 'lead', email: 'lead@gmail.com' };

      expect(state).toEqual(initialUsersState);

      const stateResult: fromReducer.UsersState = { usersList: [updatedUser], error: undefined, loadingAction: false };
      state = fromReducer.reducer(initialUsersState, usersActions.updateUserSuccessAction({ user: updatedUser }));

      expect(state).toEqual(stateResult);
    });

    it('should delete an existing user and update the state in an immutable way', () => {
      let state = fromReducer.reducer(initialUsersState, { type: undefined });

      expect(state).toEqual(initialUsersState);

      const newState: fromReducer.UsersState = { usersList: [], error: undefined, loadingAction: false };
      state = fromReducer.reducer(initialUsersState, usersActions.deleteUserSuccessAction({ id: 1 }));

      expect(state).toEqual(newState);
    });
  });
});
