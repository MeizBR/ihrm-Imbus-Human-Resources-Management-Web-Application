import { createSelector } from '@ngrx/store';

import { AppState } from '..';
import { selectUserSession } from '../auth';
import { getCalendarList } from '../calendar';
import * as eventReducer from '../event/event.reducer';
import { CalendarDetails, EventDetails } from '../../../shared/models';
import { RoleModel } from '../../../shared/enum/role-model.enum';

export const selectFeature = (state: AppState) => state[eventReducer.eventReducerKey];
export const getEventsError = createSelector(selectFeature, state => state.error);
export const getEventsList = createSelector(selectFeature, state => state.eventsList);
export const getEventsLoading = createSelector(selectFeature, state => state.loadingAction);
export const getSelectedEvent = createSelector(selectFeature, state => state.selectedEvent);

export const getEventsDetailsList = createSelector(getEventsList, getCalendarList, (events, calendars): EventDetails[] =>
  events?.map(event => ({
    ...event,
    calendarName: calendars?.find(calendar => calendar.id === event.calendarId)?.name,
  })),
);

export const getEventsDetailedList = createSelector(getEventsList, getCalendarList, selectUserSession, (events, calendars, userSession): EventDetails[] =>
  events?.map(event => ({
    ...event,
    calendarName: calendars?.find(calendar => calendar.id === event.calendarId)?.name,
    userPermission: {
      canDelete: userSession?.globalRoles.includes(RoleModel.Administrator) || event?.creator === userSession?.userId,
    },
  })),
);

export const getSelectedEventDetails = createSelector(
  getSelectedEvent,
  getCalendarList,
  selectUserSession,
  (event, calendars, userSession): EventDetails => ({
    ...event,
    calendarName: calendars?.find(calendar => calendar?.id === event?.calendarId)?.name,
    userPermission: {
      canDelete: userSession?.globalRoles.includes(RoleModel.Administrator) || event?.creator === userSession?.userId,
    },
  }),
);

export const getEventCalendarsList = createSelector(getCalendarList, getSelectedEvent, selectUserSession, (calendars, event, userSession): CalendarDetails[] => {
  return event?.creator === userSession?.userId ? calendars : calendars?.filter(cal => !cal?.isPrivate);
});
