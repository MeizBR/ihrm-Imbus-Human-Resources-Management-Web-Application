import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs';

import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';

import { cold, hot } from 'jasmine-marbles';

import { selectUserSession } from '..';
import { authActions } from '../auth.actions';
import { AuthEffects } from '../auth.effects';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../services/notification.service';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { UserSessionDetails } from '../../../../shared/models/user-models/user-session-data';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('Auth Effects', () => {
  // tslint:disable:no-any
  let actions: Observable<any>;
  let effects: AuthEffects;
  let authService: jasmine.SpyObj<AuthService>;
  const sessionDetails: UserSessionDetails = {
    workspaceId: 1,
    userId: 1,
    fullName: 'user',
    token: 'ABCD',
    globalRoles: [RoleModel.Administrator],
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, StoreModule.forRoot({}), AngularMaterialModule, RouterTestingModule],
      providers: [
        AuthEffects,
        provideMockActions(() => actions),
        provideMockStore({
          initialState: {
            authReducer: { userSession: sessionDetails },
          },
          selectors: [
            {
              selector: selectUserSession,
              value: sessionDetails,
            },
          ],
        }),
        { provide: NotificationService, useValue: { success: () => {}, warn: () => {} } },
        { provide: AuthService, useValue: jasmine.createSpyObj('authService', ['login', 'getCurrentSession', 'logout']) },
      ],
    });
    effects = TestBed.inject(AuthEffects);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  describe('login', () => {
    it('should return a stream with loginSuccessAction action', () => {
      const action = authActions.loginAction({
        user: {
          workspace: 'imbus',
          login: 'admin',
          password: 'adminPass',
        },
      });
      const outcome = authActions.loginSuccessAction({ user: sessionDetails });
      actions = hot('-a', { a: action });
      authService.login.and.returnValue(cold('-a', { a: sessionDetails }));

      expect(effects.login$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('restore user session', () => {
    it('should return a stream with RestoreUserSessionSuccessAction action', () => {
      const action = authActions.RestoreUserSessionAction({ workspaceId: 1 });
      const outcome = authActions.RestoreUserSessionSuccessAction({ sessionDetails });
      authService.getCurrentSession.and.returnValue(cold('-a', { a: sessionDetails }));
      actions = hot('-a', { a: action });

      expect(effects.restoreUserSession$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('logout', () => {
    it('should return a stream with logoutSuccessAction action', () => {
      const action = authActions.logoutAction();
      const outcome = authActions.logoutSuccessAction();
      actions = hot('-a', { a: action });
      authService.logout.and.returnValue(cold('-a', { a: true }));

      expect(effects.logout$).toBeObservable(cold('--b', { b: outcome }));
    });
  });
});
