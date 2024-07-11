import { createAction, props } from '@ngrx/store';

import { ErrorType } from '../../../shared/validators/validation-error-type';
import { EventDetails } from '../../../shared/models/event-models/event-details';
import { EventToAdd, EventToUpdate } from '../../../shared/models/event-models/event-info-data';

export enum ActionTypes {
  LOAD_ALL_EVENTS = '[eventManagement] Loaded Events',
  LOAD_ALL_EVENTS_SUCCESS = '[eventManagement] Loaded Events Success',

  LOAD_EVENT_DETAILS = '[eventManagement] Loaded Event Details',
  LOAD_EVENT_DETAILS_SUCCESS = '[eventManagement] Loaded Event Details Success',

  ADD_EVENT = '[eventManagement] Added Event',
  ADD_EVENT_SUCCESS = '[eventManagement] Added Event Success',

  UPDATE_EVENT = '[eventManagement] Updated Event',
  UPDATE_EVENT_SUCCESS = '[eventManagement] Updated Event Success',

  DELETE_EVENT = '[eventManagement] Deleted Event',
  DELETE_EVENT_SUCCESS = '[eventManagement] Deleted Event Success',

  EVENTS_MANAGEMENT_FAILED = '[eventManagement] Event Management Failed',

  RESET_EVENTS_STATE = '[eventManagement] Reset State',
}

export const eventsActions = {
  loadAllEventsAction: createAction(ActionTypes.LOAD_ALL_EVENTS),
  loadAllEventsActionSuccess: createAction(ActionTypes.LOAD_ALL_EVENTS_SUCCESS, props<{ eventsList: EventDetails[] }>()),

  loadEventDetailsAction: createAction(ActionTypes.LOAD_EVENT_DETAILS, props<{ eventId: number }>()),
  loadEventDetailsActionSuccess: createAction(ActionTypes.LOAD_EVENT_DETAILS_SUCCESS, props<{ event: EventDetails }>()),

  addEventAction: createAction(ActionTypes.ADD_EVENT, props<{ eventToAdd: EventToAdd }>()),
  addEventActionSuccess: createAction(ActionTypes.ADD_EVENT_SUCCESS, props<{ addedEvent: EventDetails }>()),

  updateEventAction: createAction(ActionTypes.UPDATE_EVENT, props<{ eventToUpdate: EventToUpdate }>()),
  updateEventActionSuccess: createAction(ActionTypes.UPDATE_EVENT_SUCCESS, props<{ event: EventDetails }>()),

  deleteEventAction: createAction(ActionTypes.DELETE_EVENT, props<{ id: number }>()),
  deleteEventSuccessAction: createAction(ActionTypes.DELETE_EVENT_SUCCESS, props<{ id: number }>()),

  eventManagementFailedAction: createAction(ActionTypes.EVENTS_MANAGEMENT_FAILED, props<{ withSnackBarNotification: boolean; errorType: ErrorType }>()),

  ResetEventsStateAction: createAction(ActionTypes.RESET_EVENTS_STATE),
};
