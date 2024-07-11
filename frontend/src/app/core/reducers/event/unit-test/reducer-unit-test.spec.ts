import * as fromReducer from '../event.reducer';
import { eventsActions } from '../event.actions';

import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { EventDetails, EventToAdd } from '../../../../shared/models/index';

describe('Event reducer', () => {
  const eventA: EventDetails = {
    id: 1,
    calendarId: 1,
    start: new Date('2021-01-01'),
    end: new Date('2021-01-01'),
    title: 'First Event',
    description: 'Description for First Event',
    repetition: Repetitive.Monthly,
    allDay: true,
    eventType: EventType.Meeting,
  };

  const eventB: EventDetails = {
    id: 2,
    calendarId: 2,
    start: new Date('2021-02-01'),
    end: new Date('2021-02-01'),
    title: 'Second Event',
    description: 'Description for Second Event',
    repetition: Repetitive.Yearly,
    allDay: true,
    eventType: EventType.Workshop,
  };

  const initialEventState = fromReducer.initialEventsState;

  const eventToAdd: EventToAdd = {
    calendarId: 2,
    start: new Date('2021-02-01'),
    end: new Date('2021-02-01'),
    title: 'Second Event',
    description: 'Description for Second Event',
    allDay: true,
    eventType: EventType.Workshop,
  };

  describe('An unknown action', () => {
    it('should return the default state', () => {
      const state = fromReducer.reducer(initialEventState, { type: undefined });

      expect(state).toBe(initialEventState);
    });
  });

  describe('Events managements actions', () => {
    it('should load all events and update the state in an immutable way', () => {
      const newState: fromReducer.EventsState = { eventsList: [eventA, eventB], selectedEvent: undefined, error: undefined, loadingAction: false };

      // INFO: First scenario: load events list when the list is undefined `eventsList = undefined`
      let state = fromReducer.reducer(initialEventState, eventsActions.loadAllEventsAction());
      expect(state).toEqual({ ...initialEventState, loadingAction: true });

      state = fromReducer.reducer(initialEventState, eventsActions.loadAllEventsActionSuccess({ eventsList: [] }));
      expect(state).toEqual({ ...newState, eventsList: [] });

      // INFO: Second scenario: load events list when the list is empty `eventsList = []`
      state = fromReducer.reducer({ ...initialEventState, eventsList: [] }, eventsActions.loadAllEventsAction());
      expect(state).toEqual({ ...initialEventState, eventsList: [], loadingAction: true });

      state = fromReducer.reducer(initialEventState, eventsActions.loadAllEventsActionSuccess({ eventsList: [eventA] }));
      expect(state).toEqual({ ...newState, eventsList: [eventA] });

      // INFO: Third scenario: load events list when the list has some items `eventsList = [evA]`
      state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA] }, eventsActions.loadAllEventsAction());
      expect(state).toEqual({ ...initialEventState, eventsList: [eventA], loadingAction: true });

      state = fromReducer.reducer(initialEventState, eventsActions.loadAllEventsActionSuccess({ eventsList: [eventA, eventB] }));
      expect(state).toEqual({ ...newState, eventsList: [eventA, eventB] });
    });

    it('should add new event and update the state in an immutable way', () => {
      const newState: fromReducer.EventsState = { eventsList: [eventB], selectedEvent: undefined, error: undefined, loadingAction: false };

      // INFO: First scenario: add event to an undefined list `eventsList = undefined`
      let state = fromReducer.reducer(initialEventState, eventsActions.addEventAction({ eventToAdd }));
      expect(state).toEqual({ ...initialEventState, loadingAction: true });

      state = fromReducer.reducer(initialEventState, eventsActions.addEventActionSuccess({ addedEvent: eventB }));
      expect(state).toEqual(newState);

      // INFO: Second scenario: add events list to a list empty `eventsList = []`
      state = fromReducer.reducer({ ...initialEventState, eventsList: [] }, eventsActions.addEventAction({ eventToAdd }));
      expect(state).toEqual({ ...initialEventState, eventsList: [], loadingAction: true });

      state = fromReducer.reducer({ ...initialEventState, eventsList: [] }, eventsActions.addEventActionSuccess({ addedEvent: eventA }));
      expect(state).toEqual({ ...newState, eventsList: [eventA] });

      // // INFO: Third scenario: add event to a list when it has some items `eventsList = [evA, evB]`
      // state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA] }, eventsActions.addEventAction({ eventToAdd }));
      // expect(state).toEqual({ ...newState, eventsList: [eventA], loadingAction: true });

      // state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA] }, eventsActions.addEventActionSuccess({ addedEvent: eventB }));
      // expect(state).toEqual({ ...newState, eventsList: [eventA], loadingAction: true });
    });

    it('should update an existing event data and update the state in an immutable way', () => {
      const newDesc = 'Description for First Event updated';
      const newState = { ...initialEventState, eventsList: [eventA], error: undefined, loadingAction: false };

      // INFO: update event with an undefined action
      let state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA] }, { type: undefined });
      expect(state).toEqual({ ...initialEventState, eventsList: [eventA] });

      // INFO: update the only one existing event
      state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA] }, eventsActions.updateEventActionSuccess({ event: { ...eventA, description: newDesc } }));
      expect(state).toEqual({ ...newState, eventsList: [{ ...eventA, description: newDesc }], selectedEvent: { ...eventA, description: newDesc } });

      // INFO: update one of the existing events
      state = fromReducer.reducer(
        { ...initialEventState, eventsList: [eventA, eventB] },
        eventsActions.updateEventActionSuccess({ event: { ...eventB, title: 'Second Event edited' } }),
      );
      expect(state).toEqual({ ...newState, eventsList: [eventA, { ...eventB, title: 'Second Event edited' }], selectedEvent: { ...eventB, title: 'Second Event edited' } });

      // INFO: update a none existing event should return the old state
      state = fromReducer.reducer(
        { ...initialEventState, eventsList: [eventA, eventB] },
        eventsActions.updateEventActionSuccess({ event: { ...eventB, id: 3, title: 'None existing event' } }),
      );
      expect(state).toEqual({ ...newState, eventsList: [eventA, eventB] });
    });

    it('should delete an existing event and update the state in an immutable way', () => {
      const eventC = { ...eventB, id: 3, title: 'Third Event' };
      const newState: fromReducer.EventsState = { eventsList: [], selectedEvent: undefined, error: undefined, loadingAction: false };

      // INFO: delete an event with an undefined action
      let state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA, eventB], selectedEvent: eventB }, { type: undefined });
      expect(state).toEqual({ ...initialEventState, eventsList: [eventA, eventB], selectedEvent: eventB });

      // INFO: delete the only one existing event
      state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA], selectedEvent: eventA }, eventsActions.deleteEventSuccessAction({ id: 1 }));
      expect(state).toEqual({ ...newState, eventsList: [], selectedEvent: undefined });

      // INFO: delete one of the existing events
      state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA, eventB, eventC] }, eventsActions.deleteEventSuccessAction({ id: 2 }));
      expect(state).toEqual({ ...newState, eventsList: [eventA, eventC] });

      // INFO: update a none existing event should return the old state
      state = fromReducer.reducer({ ...initialEventState, eventsList: [eventA, eventB] }, eventsActions.deleteEventSuccessAction({ id: 3 }));
      expect(state).toEqual({ ...newState, eventsList: [eventA, eventB] });
    });
  });
});
