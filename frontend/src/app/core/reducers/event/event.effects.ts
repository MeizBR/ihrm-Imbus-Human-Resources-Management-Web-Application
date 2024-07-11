import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { eventsActions } from './event.actions';

import { EventsService } from '../../services/events/events.service';
import { NotificationService } from '../../services/notification.service';

import { BackendJsonError, ErrorType } from '../../../shared/validators/validation-error-type';
import { EventDetails, mapEventToAddToPostEvent, mapEventToUpdateToPatchEvent } from '../../../shared/models/index';

@Injectable()
export class EventEffects {
  loadAllEvents$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(eventsActions.loadAllEventsAction),
      concatMap(_ =>
        this.eventsService.getEvents().pipe(
          map((events: EventDetails[]) => eventsActions.loadAllEventsActionSuccess({ eventsList: events })),
          catchError((error: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: error.error.failureType, // TODO: to be defined with the backend team
            };

            return of(eventsActions.eventManagementFailedAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  loadEventDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(eventsActions.loadEventDetailsAction),
      concatMap(action => {
        return this.eventsService.getEventDetails(action.eventId).pipe(
          map((event: EventDetails) => eventsActions.loadEventDetailsActionSuccess({ event })),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.error.status,
              errorType: err.error.failureType, // TODO: to be defined with the backend team
            };
            this.notificationService.warn(err.error.failureType);
            this.router.navigate(['home', 'events']);

            return of(eventsActions.eventManagementFailedAction({ withSnackBarNotification: false, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    );
  });

  addEvent$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(eventsActions.addEventAction),
      concatMap(action => {
        return this.eventsService.postEvent(mapEventToAddToPostEvent(action.eventToAdd)).pipe(
          map((event: EventDetails) => {
            this.notificationService.success('Added successfully');

            return eventsActions.addEventActionSuccess({ addedEvent: event });
          }),
          catchError((error: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: error.error.failureType, // TODO: to be defined with the backend team
            };

            return of(
              eventsActions.eventManagementFailedAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.NameAlreadyExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        );
      }),
    );
  });

  updateEvent$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(eventsActions.updateEventAction),
      concatMap(action =>
        this.eventsService.patchEvent(mapEventToUpdateToPatchEvent(action.eventToUpdate), action.eventToUpdate.id).pipe(
          map((event: EventDetails) => {
            this.notificationService.success('Event successfully Updated');

            return eventsActions.updateEventActionSuccess({ event });
          }),
          catchError((error: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: error.status,
              errorType: 1005, // TODO: to be defined with the backend team
            };

            return of(
              eventsActions.eventManagementFailedAction({
                withSnackBarNotification: true,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  deleteEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(eventsActions.deleteEventAction),
      concatMap(action =>
        this.eventsService.deleteEvent(action.id).pipe(
          map(_ => {
            this.notificationService.success('Deleted successfully');
            if (this.router.url !== '/home/events') {
              this.router.navigate(['home', 'events']);
            }

            return eventsActions.deleteEventSuccessAction({ id: action.id });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(eventsActions.eventManagementFailedAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    ),
  );

  leaveManagementFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(eventsActions.eventManagementFailedAction),
        tap(action => {
          const msg = ErrorType.getErrorMessage({ [action.errorType]: true });
          this.notificationService.warn(msg);
        }),
      ),
    { dispatch: false },
  );
  constructor(private actions$: Actions, private eventsService: EventsService, private notificationService: NotificationService, private router: Router) {}
}
