import { ActionTypes, eventsActions } from '../../../reducers/event/event.actions';

import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { EventDetails, EventToAdd, EventToUpdate } from '../../../../shared/models/index';

describe('Event actions', () => {
  const eventA: EventDetails = {
    id: 1,
    calendarId: 1,
    start: new Date('2021-01-01T10:00:00.000Z'),
    end: new Date('2021-01-01T10:00:00.000Z'),
    title: 'First Event',
    description: 'Description for First Event',
    repetition: Repetitive.Monthly,
    allDay: true,
    eventType: EventType.Meeting,
  };

  const eventB: EventDetails = {
    id: 2,
    calendarId: 2,
    start: new Date('2021-02-01T09:00:00.000Z'),
    end: new Date('2021-02-01T09:30:00.000Z'),
    title: 'Second Event',
    description: 'Description for Second Event',
    repetition: Repetitive.Monthly,
    allDay: false,
    eventType: EventType.Meeting,
  };

  describe('Load events actions', () => {
    it('should create loadAllEventsAction action', () => {
      const action = eventsActions.loadAllEventsAction();
      expect(action).toEqual({ type: ActionTypes.LOAD_ALL_EVENTS });
    });

    it('should create loadAllEventsActionSuccess action', () => {
      const action = eventsActions.loadAllEventsActionSuccess({ eventsList: [eventA, eventB] });

      expect(action).toEqual({ eventsList: [eventA, eventB], type: ActionTypes.LOAD_ALL_EVENTS_SUCCESS });
    });
  });

  describe('Add event actions', () => {
    it('should create addEventAction action', () => {
      const eventToAdd: EventToAdd = {
        calendarId: 1,
        start: new Date('2021-01-01T10:00:00.000Z'),
        end: new Date('2021-01-01T10:00:00.000Z'),
        title: 'First Event',
        description: 'Description for First Event',
        repetition: Repetitive.Monthly,
        allDay: true,
        eventType: EventType.Meeting,
      };
      const action = eventsActions.addEventAction({ eventToAdd });
      expect(action).toEqual({ eventToAdd, type: ActionTypes.ADD_EVENT });
    });

    it('should create addEventActionSuccess action', () => {
      const action = eventsActions.addEventActionSuccess({ addedEvent: eventA });

      expect(action).toEqual({ addedEvent: eventA, type: ActionTypes.ADD_EVENT_SUCCESS });
    });
  });

  describe('Update event actions', () => {
    it('should create updateEventAction action', () => {
      const eventToUpdate: EventToUpdate = {
        id: 1,
        description: 'Description for First Event updated',
        repetition: Repetitive.Yearly,
        eventType: EventType.Workshop,
      };

      const action = eventsActions.updateEventAction({ eventToUpdate });
      expect(action).toEqual({ eventToUpdate, type: ActionTypes.UPDATE_EVENT });
    });

    it('should create updateEventActionSuccess action', () => {
      const event = {
        ...eventA,
        description: 'Description for First Event updated',
        repetition: Repetitive.Yearly,
        eventType: EventType.Workshop,
      };
      const action = eventsActions.updateEventActionSuccess({ event });
      expect(action).toEqual({ event, type: ActionTypes.UPDATE_EVENT_SUCCESS });
    });
  });

  describe('Delete event actions', () => {
    it('should create deleteEventAction action', () => {
      const action = eventsActions.deleteEventAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_EVENT });
    });

    it('should create deleteEventSuccessAction action', () => {
      const action = eventsActions.deleteEventSuccessAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_EVENT_SUCCESS });
    });
  });

  describe('Event management actions', () => {
    it('should create eventManagementFailedAction action', () => {
      const action = eventsActions.eventManagementFailedAction({ withSnackBarNotification: false, errorType: ErrorType.Minlength });
      expect(action.type).toEqual(ActionTypes.EVENTS_MANAGEMENT_FAILED);
    });
  });
});
