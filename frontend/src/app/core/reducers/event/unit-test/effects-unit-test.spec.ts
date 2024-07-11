import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs';

import { cold, hot } from 'jasmine-marbles';

import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';

import { reducers } from '../..';
import { EventEffects } from '../event.effects';
import { getCalendarList } from '../../calendar';
import { eventsActions } from '../event.actions';
import { EventsService } from '../../../../core/services/events/events.service';

import { NotificationService } from '../../../services/notification.service';

import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { EventDetails, EventToAdd, EventToUpdate } from '../../../../shared/models/index';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';
import { EventsListComponent } from '../../../../modules/events-management/events-list/events-list.component';

describe('Event Effects', () => {
  // tslint:disable:no-any
  let actions: Observable<any>;
  let effects: EventEffects;
  let eventsService: jasmine.SpyObj<EventsService>;

  const eventA: EventDetails = {
    id: 1,
    calendarId: 1,
    isPrivateCalendar: false,
    start: new Date('2021-01-01'),
    end: new Date('2021-01-01'),
    title: 'First Event',
    description: 'Description for First Event',
    repetition: Repetitive.Monthly,
    allDay: true,
    eventType: EventType.Meeting,
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
        RouterTestingModule.withRoutes([{ path: 'home/events', component: EventsListComponent }]),
        AngularMaterialModule,
      ],
      providers: [
        EventEffects,
        provideMockActions(() => actions),
        provideMockStore({
          initialState: {
            calendarReducer: { calendarsList: undefined },
          },
          selectors: [
            {
              selector: getCalendarList,
              value: [
                {
                  id: 1,
                  project: 1,
                  name: 'Calendar N° 1',
                  description: 'Description',
                  isPrivate: false,
                  userId: 1,
                  timeZone: 'Africa/Tunis',
                  eventCompleted: true,
                  leaveCompleted: true,
                },
              ],
            },
          ],
        }),
        { provide: NotificationService, useValue: { success: () => {}, warn: () => {} } },
        { provide: EventsService, useValue: jasmine.createSpyObj('eventsService', ['postEvent', 'getEvents', 'patchEvent', 'deleteEvent']) },
      ],
    });
    effects = TestBed.inject(EventEffects);
    eventsService = TestBed.inject(EventsService) as jasmine.SpyObj<EventsService>;
  });

  describe('Load events list', () => {
    it('should return a stream with loadAllEventsActionSuccess action', () => {
      const action = eventsActions.loadAllEventsAction();
      const outcome = eventsActions.loadAllEventsActionSuccess({ eventsList: [eventA] });
      actions = hot('-a', { a: action });
      eventsService.getEvents.and.returnValue(cold('-a', { a: [eventA] }));

      expect(effects.loadAllEvents$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('Add event', () => {
    const eventToAdd: EventToAdd = {
      calendarId: 1,
      start: new Date('2021-01-01'),
      end: new Date('2021-01-01'),
      title: 'Event To Add',
      description: 'Description for Event To Add',
      repetition: Repetitive.Monthly,
      allDay: true,
      eventType: EventType.Meeting,
    };

    it('should return a stream with addEventActionSuccess action', () => {
      const action = eventsActions.addEventAction({ eventToAdd });
      const outcome = eventsActions.addEventActionSuccess({ addedEvent: eventA });
      actions = hot('-a', { a: action });
      eventsService.postEvent.and.returnValue(cold('-a|', { a: eventA }));

      expect(effects.addEvent$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('update event', () => {
    const eventToUpdate: EventToUpdate = { id: 1, description: 'Description for First Event updated' };
    it('should return a stream with updateEventActionSuccess action', () => {
      const action = eventsActions.updateEventAction({ eventToUpdate });
      const outcome = eventsActions.updateEventActionSuccess({ event: { ...eventA, description: 'Description for First Event updated' } });
      actions = hot('-a', { a: action });
      eventsService.patchEvent.and.returnValue(cold('-a|', { a: { ...eventA, description: 'Description for First Event updated' } }));

      expect(effects.updateEvent$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('delete event', () => {
    it('should return a stream with deleteEventSuccessAction action', () => {
      const action = eventsActions.deleteEventAction({ id: 1 });
      const outcome = eventsActions.deleteEventSuccessAction({ id: 1 });
      actions = hot('-a', { a: action });
      eventsService.deleteEvent.and.returnValue(cold('-a|', { a: '' }));

      expect(effects.deleteEvent$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('Event management failure', () => {
    it('should return a notification', () => {
      const action = eventsActions.eventManagementFailedAction({ withSnackBarNotification: false, errorType: ErrorType.InternalServerError });
      actions = hot('-a', { a: action });
      expect(effects.addEvent$).toBeObservable(cold(''));
    });
  });
});
