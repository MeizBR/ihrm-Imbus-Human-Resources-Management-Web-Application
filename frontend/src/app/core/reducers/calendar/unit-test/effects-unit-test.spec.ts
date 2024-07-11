import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { Observable } from 'rxjs';

import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { cold, hot } from 'jasmine-marbles';

import { reducers } from '../..';
import { CalendarEffects } from '../calendar.effects';
import { calendarsActions } from '../calendar.actions';

import { CalendarService } from '../../../services/calendar/calendar.service';
import { NotificationService } from '../../../services/notification.service';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CalendarToAdd } from '../../../../shared/models/calendar-models/calendar-models-index';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';
import { CalendarsManagementGuard } from '../../../../core/services/calendar/calendars-management.guard';

describe('User Effects', () => {
  // tslint:disable:no-any
  let actions: Observable<any>;
  let effects: CalendarEffects;
  let calendarsService: jasmine.SpyObj<CalendarService>;
  const calendarA = {
    id: 1,
    project: 1,
    name: 'Calendar N° 1',
    description: 'Description',
    isPrivate: false,
    userId: 1,
    timeZone: 'Africa/Tunis',
    eventChecked: true,
    leaveChecked: true,
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
        RouterTestingModule.withRoutes([{ path: 'home/calendars/calendars-management', component: CalendarsManagementGuard }]),
      ],
      providers: [
        CalendarEffects,
        provideMockActions(() => actions),
        { provide: NotificationService, useValue: { success: () => {}, warn: () => {} } },
        { provide: CalendarService, useValue: jasmine.createSpyObj('calendarsService', ['getAllCalendars', 'postCalendar', 'patchCalendar', 'deleteCalendar']) },
      ],
    });
    effects = TestBed.inject(CalendarEffects);
    calendarsService = TestBed.inject(CalendarService) as jasmine.SpyObj<CalendarService>;
  });

  describe('Load calendars list', () => {
    it('should return a stream with loadAllCalendarsActionSuccess action', () => {
      const action = calendarsActions.loadAllCalendarsAction();
      const outcome = calendarsActions.loadAllCalendarsActionSuccess({ calendarsList: [calendarA] });
      actions = hot('-a', { a: action });
      calendarsService.getAllCalendars.and.returnValue(cold('-a', { a: [calendarA] }));

      expect(effects.loadAllCalendars$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('Add calendar', () => {
    const calendarToAdd: CalendarToAdd = {
      project: 1,
      name: 'Calendar N° 1',
      description: 'Description',
      isPrivate: false,
      timeZone: 'Africa/Tunis',
    };
    it('should return a stream with addCalendarActionSuccess action', () => {
      const action = calendarsActions.addCalendarAction({ calendarToAdd });
      const outcome = calendarsActions.addCalendarActionSuccess({ addedCalendar: { ...calendarToAdd, id: 1, userId: 1 } });
      actions = hot('-a', { a: action });
      calendarsService.postCalendar.and.returnValue(cold('-a|', { a: { ...calendarToAdd, id: 1, userId: 1 } }));

      expect(effects.addCalendar$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('Update calendar', () => {
    it('should return a stream with updateCalendarSuccessAction action', () => {
      const action = calendarsActions.updateCalendarAction({ id: 1, calendarToUpdate: { description: 'New Description' } });
      const outcome = calendarsActions.updateCalendarSuccessAction({ updatedCalendar: { ...calendarA, description: 'New Description', isPrivate: true } });
      actions = hot('-a', { a: action });
      calendarsService.patchCalendar.and.returnValue(
        cold('-a|', {
          a: {
            ...calendarA,
            description: 'New Description',
            isPrivate: true,
          },
        }),
      );

      expect(effects.updateCalendar$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('delete calendar', () => {
    it('should return a stream with deleteCalendarSuccessAction action', () => {
      const action = calendarsActions.deleteCalendarAction({ id: 1 });
      const outcome = calendarsActions.deleteCalendarSuccessAction({ id: 1 });
      actions = hot('-a', { a: action });
      calendarsService.deleteCalendar.and.returnValue(cold('-a|', { a: '' }));

      expect(effects.deleteCalendar$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('Calendar management failure', () => {
    it('should return a notification', () => {
      let action = calendarsActions.calendarManagementFailedAction({ withSnackBarNotification: false, errorType: ErrorType.InternalServerError });
      actions = hot('-a', { a: action });
      expect(effects.loadAllCalendars$).toBeObservable(cold(''));

      action = calendarsActions.calendarManagementFailedAction({ withSnackBarNotification: false, errorType: ErrorType.NameAlreadyExists });
      actions = hot('-a', { a: action });
      expect(effects.addCalendar$).toBeObservable(cold(''));

      action = calendarsActions.calendarManagementFailedAction({ withSnackBarNotification: false, errorType: ErrorType.NameAlreadyExists });
      actions = hot('-a', { a: action });
      expect(effects.updateCalendar$).toBeObservable(cold(''));
    });
  });
});
