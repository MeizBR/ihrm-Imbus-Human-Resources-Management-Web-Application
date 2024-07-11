import { Action, createReducer, on } from '@ngrx/store';

import { eventsActions } from './event.actions';

import { EventDetails } from '../../../shared/models/index';
import { ErrorType } from '../../../shared/validators/validation-error-type';

export const eventReducerKey = 'eventReducer';

export interface EventsState {
  eventsList: EventDetails[] | undefined;
  selectedEvent: EventDetails;
  error: ErrorType | undefined;
  loadingAction: boolean | undefined;
}

export const initialEventsState: EventsState = {
  eventsList: undefined,
  selectedEvent: undefined,
  error: undefined,
  loadingAction: false,
};

const eventReducer = createReducer(
  initialEventsState,
  on(eventsActions.loadAllEventsAction, (state, _): EventsState => ({ ...state, error: undefined, loadingAction: true })),
  on(eventsActions.loadAllEventsActionSuccess, (state, payload): EventsState => ({ ...state, eventsList: payload.eventsList, error: undefined, loadingAction: false })),
  on(eventsActions.loadEventDetailsAction, (state, _): EventsState => ({ ...state, error: undefined, loadingAction: true })),
  on(eventsActions.loadEventDetailsActionSuccess, (state, payload): EventsState => ({ ...state, selectedEvent: payload.event, error: undefined, loadingAction: false })),
  on(eventsActions.addEventAction, (state, _): EventsState => ({ ...state, error: undefined, loadingAction: true })),
  on(
    eventsActions.addEventActionSuccess,
    (state, payload): EventsState => ({
      ...state,
      eventsList: state.eventsList ? [...state.eventsList, payload.addedEvent] : [payload.addedEvent],
      error: undefined,
      loadingAction: false,
    }),
  ),
  on(eventsActions.updateEventAction, (state, _): EventsState => ({ ...state, error: undefined, loadingAction: true })),
  on(
    eventsActions.updateEventActionSuccess,
    (state, payload): EventsState => {
      const isValidEvent = !!state.eventsList.find(event => event.id === payload.event?.id);

      return {
        ...state,
        error: undefined,
        loadingAction: false,
        eventsList: [...state.eventsList.map(event => (event.id === payload.event?.id ? payload.event : event))],
        selectedEvent: isValidEvent ? payload.event : undefined,
      };
    },
  ),

  on(
    eventsActions.deleteEventAction,
    (state, _): EventsState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    eventsActions.deleteEventSuccessAction,
    (state, payload): EventsState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        eventsList: [...state.eventsList?.filter(event => event.id !== payload.id)],
        selectedEvent: state.selectedEvent?.id === payload.id ? undefined : state.selectedEvent,
      };
    },
  ),
  on(eventsActions.ResetEventsStateAction, (): EventsState => ({ ...initialEventsState })),
);

export function reducer(state: EventsState | undefined, action: Action): EventsState {
  return eventReducer(state, action);
}
