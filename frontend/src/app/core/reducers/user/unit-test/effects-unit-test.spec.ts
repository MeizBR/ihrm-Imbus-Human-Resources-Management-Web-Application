import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs';

import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { cold, hot } from 'jasmine-marbles';

import { reducers } from '../..';
import { UserEffects } from '../user.effects';
import { usersActions } from '../user.actions';

import { TeamService } from '../../../services/team/team.service';
import { NotificationService } from '../../../services/notification.service';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { UserDetails, UserForAdd, UserForUpdate } from '../../../../shared/models/index';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';
import { UsersListComponent } from '../../../../modules/team-management/usersList/users-list.component';

describe('User Effects', () => {
  // tslint:disable:no-any
  let actions: Observable<any>;
  let effects: UserEffects;
  let usersService: jasmine.SpyObj<TeamService>;

  const johnDoe: UserDetails = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    login: 'admin',
    email: 'admin@gmail.com',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        AngularMaterialModule,
        RouterTestingModule.withRoutes([{ path: 'home/team', component: UsersListComponent }]),
      ],
      providers: [
        UserEffects,
        provideMockActions(() => actions),
        { provide: NotificationService, useValue: { success: () => {}, warn: () => {} } },
        { provide: TeamService, useValue: jasmine.createSpyObj('usersService', ['getUsers', 'postUsers', 'patchUsers', 'deleteUsers']) },
      ],
    });
    effects = TestBed.inject(UserEffects);
    usersService = TestBed.inject(TeamService) as jasmine.SpyObj<TeamService>;
  });

  // NOTE: Test of failure to be done after understanding the marbles syntax
  // TODO: Research how to test effects that use forkJoin
  xdescribe('load users list', () => {
    it('should return a stream with loadUsersAction action', () => {
      const usersList: UserDetails[] = [johnDoe];
      const action = usersActions.loadUsersAction();
      const outcome = usersActions.loadUsersSuccessAction({ usersList });

      actions = hot('-a', { a: action });
      usersService.getUsers.and.returnValue(cold('-a', { a: usersList }));

      expect(effects.loadUsers$).toBeObservable(cold('--b', { b: outcome })); // TODO: verify this scenario and expectation please
    });
  });

  describe('add user', () => {
    const userToAdd: UserForAdd = { firstName: 'John', lastName: 'Doe', login: 'admin', email: 'admin@gmail.com', password: 'adminPass', isActive: true, registrationNumber: 1500 };
    it('should return a stream with addUserSuccessAction action', () => {
      const action = usersActions.addUserAction({ user: userToAdd });
      const outcome = usersActions.addUserSuccessAction({ user: johnDoe });
      actions = hot('-a', { a: action });
      usersService.postUsers.and.returnValue(cold('-a|', { a: johnDoe }));

      expect(effects.addUser$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('update user', () => {
    const userToUpdate: UserForUpdate = {
      firstName: 'John Jack',
      lastName: 'DoeMe',
      login: 'admin',
      email: 'admin@gmail.com',
      password: {
        connectedPassword: 'adminPass',
        newPassword: 'newPass',
      },
      note: 'the user note',
      isActive: false,
    };
    it('should return a stream with updateUserSuccessAction action', () => {
      const userUpdated: UserDetails = { ...johnDoe, firstName: 'John Jack', lastName: 'DoeMe', isActive: false };
      const action = usersActions.updateUserAction({ user: userToUpdate });
      const outcome = usersActions.updateUserSuccessAction({ user: userUpdated });
      actions = hot('-a', { a: action });
      usersService.patchUsers.and.returnValue(cold('-a|', { a: userUpdated }));

      expect(effects.updateUser$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('delete user', () => {
    it('should return a stream with deleteUserSuccessAction action', () => {
      const action = usersActions.deleteUserAction({ id: 1 });
      const outcome = usersActions.deleteUserSuccessAction({ id: 1 });
      actions = hot('-a', { a: action });
      usersService.deleteUsers.and.returnValue(cold('-a|', { a: '' }));

      expect(effects.deleteUser$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('user management failure', () => {
    it('should return a notification', () => {
      const action = usersActions.userManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.LoginExists });
      actions = hot('-a', { a: action });
      expect(effects.loadUsers$).toBeObservable(cold(''));
    });
  });
});
