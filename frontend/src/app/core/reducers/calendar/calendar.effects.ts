import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError, concatMap, map, tap, withLatestFrom } from 'rxjs/operators';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';

import { AppState } from '..';
import { getFilteredCalendars, getFilteredUsersLeaves } from '../calendar';
import { calendarsActions } from '../../reducers/calendar/calendar.actions';

import { NotificationService } from '../../services/notification.service';
import { CalendarService } from '../../services/calendar/calendar.service';

import { BackendJsonError, ErrorType } from '../../../shared/validators/validation-error-type';
import { CalendarDetails, mapCalendarToAddToPostCalendar, mapCalendarToUpdateToPatchCalendar } from '../../../shared/models/index';

@Injectable()
export class CalendarEffects {
  loadAllCalendars$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(calendarsActions.loadAllCalendarsAction),
      concatMap(_ =>
        this.calendarService.getAllCalendars().pipe(
          map((calendarList: CalendarDetails[]) => calendarsActions.loadAllCalendarsActionSuccess({ calendarsList: calendarList })),
          catchError((error: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(calendarsActions.calendarManagementFailedAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  loadCalendarDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(calendarsActions.loadCalendarDetailsAction),
      concatMap(action => {
        return this.calendarService.getCalendarDetails(action.calendarId).pipe(
          map((calendar: CalendarDetails) => calendarsActions.loadCalendarDetailsActionSuccess({ calendar })),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.error.status,
              errorType: err.error.failureType, // TODO: to be defined with the backend team
            };
            this.notificationService.warn(err.error.failureType);
            this.router.navigate(['home', 'calendars']);

            return of(calendarsActions.calendarManagementFailedAction({ withSnackBarNotification: false, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    );
  });

  addCalendar$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(calendarsActions.addCalendarAction),
      concatMap(action => {
        return this.calendarService.postCalendar(mapCalendarToAddToPostCalendar(action.calendarToAdd), action.calendarToAdd.project).pipe(
          map((calendar: CalendarDetails) => {
            this.notificationService.success('Added successfully');

            return calendarsActions.addCalendarActionSuccess({ addedCalendar: calendar });
          }),
          catchError((error: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: 1002, // TODO: to be defined with the backend team
            };

            return of(
              calendarsActions.calendarManagementFailedAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.NameAlreadyExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        );
      }),
    );
  });

  updateCalendar$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(calendarsActions.updateCalendarAction),
      concatMap(action =>
        this.calendarService.patchCalendar(action.id, mapCalendarToUpdateToPatchCalendar(action.calendarToUpdate)).pipe(
          map((calendar: CalendarDetails) => {
            this.notificationService.success('Updated successfully');

            return calendarsActions.updateCalendarSuccessAction({ updatedCalendar: calendar });
          }),
          catchError((error: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: 1002, // TODO: to be defined with the backend team
            };

            return of(
              calendarsActions.calendarManagementFailedAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.NameAlreadyExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  deleteCalendar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(calendarsActions.deleteCalendarAction),
      concatMap(action =>
        this.calendarService.deleteCalendar(action.id).pipe(
          map(_ => {
            this.notificationService.success('Deleted successfully');
            if (!this.router.url.includes('calendars-management')) {
              this.router.navigate(['home', 'calendars', 'calendars-management']);
            }

            return calendarsActions.deleteCalendarSuccessAction({ id: action.id });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(calendarsActions.calendarManagementFailedAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    ),
  );

  updateCalendarsEventsFilter$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(calendarsActions.updateCalendarsFilterListAction),
        withLatestFrom(this.store.pipe(select(getFilteredCalendars))),
        tap(([_, filteredCalendars]) => {
          localStorage.setItem('filteredCalendars', JSON.stringify(filteredCalendars));
        }),
      ),
    { dispatch: false },
  );

  updateCalendarsLeavesFilter$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(calendarsActions.updateUsersLeavesFilterListAction),
        withLatestFrom(this.store.pipe(select(getFilteredUsersLeaves))),
        tap(([_, filteredUsersLeaves]) => {
          localStorage.setItem('filteredUsersLeaves', JSON.stringify(filteredUsersLeaves));
        }),
      ),
    { dispatch: false },
  );

  calendarManagementFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(calendarsActions.calendarManagementFailedAction),
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
    private store: Store<AppState>,
    private calendarService: CalendarService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}
}
