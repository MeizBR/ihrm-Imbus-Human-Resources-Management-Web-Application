import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { leavesActions } from '../../reducers/leave/leave.actions';

import { LeavesService } from '../../services/leaves/leaves.service';
import { NotificationService } from '../../services/notification.service';

import { BackendJsonError, ErrorType } from '../../../shared/validators';
import { LeaveDetails, mapLeaveToAddToPostLeave, mapLeaveToPutToPutLeave, mapLeaveToUpdateToPatchLeave } from '../../../shared/models/index';

@Injectable()
export class LeaveEffects {
  // TODO: Error handle should be improved after setting error code in backend (In The entire app)

  loadAllLeaves$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(leavesActions.loadAllLeavesAction),
      concatMap(_ =>
        this.leavesService.getLeaves().pipe(
          map((leaves: LeaveDetails[]) => leavesActions.loadAllLeavesActionSuccess({ leavesList: leaves })),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.error.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(leavesActions.leaveManagementFailedAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  loadOwnLeave$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(leavesActions.loadLeaveDetailsAction),
      concatMap(action => {
        return this.leavesService.getOneLeave(action.leaveId).pipe(
          map((leave: LeaveDetails) => leavesActions.loadLeaveDetailsActionSuccess({ leave: leave })),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.error.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(leavesActions.leaveManagementFailedAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    );
  });

  addLeave$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(leavesActions.addLeaveAction),
      concatMap(action =>
        this.leavesService.addLeave(mapLeaveToAddToPostLeave(action.leave), action.userId).pipe(
          map((leave: LeaveDetails) => {
            this.notificationService.success('Added successfully');

            return leavesActions.addLeaveActionSuccess({ leave });
          }),
          catchError((error: HttpErrorResponse) => {
            // code 1006 To be removed after implementing the web socket
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: error.error.failureType.toString().includes('You cannot create a leave for an inactive user.') ? 1006 : 1003, // TODO: to be defined with the backend team
            };

            return of(
              leavesActions.leaveManagementFailedAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.LeaveWithSameDateExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  updateLeave$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(leavesActions.updateLeaveAction),
      concatMap(action =>
        this.leavesService.patchLeaves(mapLeaveToUpdateToPatchLeave(action.leaveUpdated), action.id).pipe(
          map((leave: LeaveDetails) => {
            this.notificationService.success('Leave successfully Updated');

            return leavesActions.updateLeaveActionSuccess({ leave: leave });
          }),
          catchError((error: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: 1003, // TODO: to be defined with the backend team
            };

            return of(
              leavesActions.leaveManagementFailedAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.LeaveWithSameDateExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  putLeaveState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(leavesActions.putLeaveStateAction),
      concatMap(action =>
        this.leavesService.putLeaveState(mapLeaveToPutToPutLeave(action.leaveStatusUpdated), action.id).pipe(
          map((leave: LeaveDetails) => {
            this.notificationService.success('Leave successfully Updated');

            return leavesActions.updateLeaveActionSuccess({ leave: leave });
          }),
          catchError((error: HttpErrorResponse) => {
            // code 1007 To be removed after implementing the web socket
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: error.error.failureType.toString().includes('Unable to update leave') ? 1007 : 1003, // TODO: to be defined with the backend team
            };

            return of(
              leavesActions.leaveManagementFailedAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.LeaveWithSameDateExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  leaveManagementFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(leavesActions.leaveManagementFailedAction),
        tap(action => {
          if (action.withSnackBarNotification) {
            const msg = ErrorType.getErrorMessage({ [action.errorType]: true }, 'element');
            this.notificationService.warn(msg);
          }
        }),
      ),
    { dispatch: false },
  );

  constructor(private actions$: Actions, private leavesService: LeavesService, private notificationService: NotificationService) {}
}
