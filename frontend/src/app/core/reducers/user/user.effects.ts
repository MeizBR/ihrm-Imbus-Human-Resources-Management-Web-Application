import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { forkJoin, of } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';

import { AppState } from '..';
import { usersActions } from './user.actions';

import { TeamService } from '../../services/team/team.service';
import { NotificationService } from '../../services/notification.service';

import { getBackendJsonError } from '../../../modules/team-management/team-helpers';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { mapToPatchUser, UserDetails, UserGLobalRoles } from '.././../../shared/models/index';
import { BackendJsonError, ErrorType } from '../../../shared/validators/validation-error-type';

@Injectable()
export class UserEffects {
  loadUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(usersActions.loadUsersAction),
      concatMap(_ =>
        this.usersService.getUsers().pipe(
          tap((users: UserDetails[]) => {
            this.store.dispatch(usersActions.loadUsersSuccessAction({ usersList: users }));
          }),
          concatMap(usersList => {
            return forkJoin(usersList.map(user => this.usersService.getUserGlobalRoles(user.id))).pipe(
              map(globalRoles => {
                const usersRoles: UserGLobalRoles[] = usersList.map((user, index) => ({ id: user.id, globalRoles: globalRoles[index] }));

                return usersActions.loadUserGlobalRolesSuccessAction({ usersGlobalRoles: usersRoles });
              }),
              catchError((err: HttpErrorResponse) => {
                const newBackendJsonError: BackendJsonError = {
                  errorCode: err.error.status,
                  errorType: 0, // TODO: to be defined with the backend team
                };

                return of(
                  usersActions.userManagementFailAction({
                    withSnackBarNotification: ![ErrorType.LoginExists, ErrorType.EmailExists, ErrorType.WrongPassword].includes(ErrorType.fromApiValue(newBackendJsonError)),
                    errorType: ErrorType.fromApiValue(newBackendJsonError),
                  }),
                );
              }),
            );
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.error.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(usersActions.userManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  addUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(usersActions.addUserAction),
      concatMap(action =>
        this.usersService.postUsers(action.user).pipe(
          map((user: UserDetails) => {
            this.notificationService.success('Added successfully');

            return usersActions.addUserSuccessAction({ user: user });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = getBackendJsonError(err);
            // NOTE: This constant was created to avoid the plush problem of maximum line length
            const listOfErrors = [ErrorType.LoginExists, ErrorType.EmailExists, ErrorType.WrongPassword, ErrorType.InvalidEmailFormat];

            return of(
              usersActions.userManagementFailAction({
                withSnackBarNotification: !listOfErrors.includes(ErrorType.fromApiValue(newBackendJsonError)),
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  updateUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(usersActions.updateUserAction),
      concatMap(action =>
        this.usersService.patchUsers(mapToPatchUser(action.user), action.user.id).pipe(
          map((user: UserDetails) => {
            this.notificationService.success('Updated successfully');

            return usersActions.updateUserSuccessAction({ user: user });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = getBackendJsonError(err);

            return of(
              usersActions.userManagementFailAction({
                withSnackBarNotification: ![ErrorType.LoginExists, ErrorType.EmailExists, ErrorType.WrongPassword].includes(ErrorType.fromApiValue(newBackendJsonError)),
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  putUserRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(usersActions.putUserRoleAction),
      concatMap(action =>
        this.usersService.setGlobalRole(action.id, action.roles).pipe(
          map((roles: RoleModel[]) => {
            this.notificationService.success('Updated successfully');

            return usersActions.putUserRoleSuccessAction({ id: action.id, roles });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = getBackendJsonError(err);

            return of(
              usersActions.userManagementFailAction({
                withSnackBarNotification: ![ErrorType.LoginExists, ErrorType.EmailExists, ErrorType.WrongPassword].includes(ErrorType.fromApiValue(newBackendJsonError)),
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(usersActions.deleteUserAction),
      concatMap(action => {
        return this.usersService.deleteUsers(action.id).pipe(
          map(_ => {
            this.notificationService.success('Deleted successfully !');
            if (this.router.url !== '/home/team') {
              this.router.navigate(['home', 'team']);
            }

            return usersActions.deleteUserSuccessAction({ id: action.id });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.error.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(usersActions.userManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    ),
  );

  userManagementFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(usersActions.userManagementFailAction),
        tap(action => {
          if (action.withSnackBarNotification) {
            const msg = ErrorType.getErrorMessage({ [action.errorType]: true }, 'element');
            this.notificationService.warn(msg);
          }
        }),
      ),
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store<AppState>,
    private usersService: TeamService,
    private notificationService: NotificationService,
  ) {}
}
