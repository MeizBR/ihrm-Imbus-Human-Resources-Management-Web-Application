import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { AppState } from '..';
import { selectUserSession } from '.';
import { authActions } from './auth.actions';

import { AuthService } from '../../services/auth/auth.service';

import { getJwtToken, removeItems, storeUserSession } from './auth.helper';

import { RouteSegment } from './../../../shared/enum/route-segment.enum';
import { BackendJsonError, ErrorType } from '../../../shared/validators/validation-error-type';
import { UserSessionDetails } from './../../../shared/models/user-models/user-session-data';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.loginAction),
      concatMap(action =>
        this.authService.login(action.user).pipe(
          map(userSession => authActions.loginSuccessAction({ user: userSession })),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: err.error.failureType === 'Wrong login or password.' ? 1000 : 1001, // TODO: to be defined with the backend team
            };

            return of(authActions.loginFailedAction({ errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    ),
  );

  restoreUserSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.RestoreUserSessionAction),
      switchMap(action => {
        return this.authService.getCurrentSession(action.workspaceId).pipe(
          map((sessionDetails: UserSessionDetails) => {
            return authActions.RestoreUserSessionSuccessAction({ sessionDetails });
          }),
          catchError(_ => of(authActions.RestoreUserSessionFailedAction())),
        );
      }),
    ),
  );

  restoreUserSessionSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.RestoreUserSessionSuccessAction),
        map(action => {
          if (!getJwtToken()) {
            storeUserSession(action.sessionDetails);
          }
        }),
      ),
    { dispatch: false },
  );

  restoreUserSessionFail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.RestoreUserSessionFailedAction),
      map(_ => {
        removeItems();
        this.router.navigate([RouteSegment.Login]);

        return authActions.ResetSessionAction();
      }),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.loginSuccessAction),
        map(action => {
          storeUserSession(action.user);
          this.router.navigate([RouteSegment.Home, RouteSegment.TimeTracker]);
        }),
      ),
    { dispatch: false },
  );

  loginFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.loginFailedAction),
        map(_ => {
          this.router.navigate([RouteSegment.Login]);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.logoutAction),
      withLatestFrom(this.store.pipe(select(selectUserSession))),
      concatMap(([_, userSession]) => {
        return this.authService.logout(userSession).pipe(
          map(__ => {
            return authActions.logoutSuccessAction();
          }),
          catchError(() => of(authActions.logoutFailedAction())),
        );
      }),
    ),
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.logoutSuccessAction, authActions.logoutFailedAction),
        map(_ => {
          removeItems();

          this.router.navigate([RouteSegment.Login]);
        }),
      ),
    { dispatch: false },
  );

  constructor(private actions$: Actions, private authService: AuthService, private router: Router, private store: Store<AppState>) {}
}
