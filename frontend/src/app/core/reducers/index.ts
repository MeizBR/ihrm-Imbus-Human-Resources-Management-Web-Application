import { ActionReducerMap, createSelector, MetaReducer } from '@ngrx/store';

import * as authState from './auth/auth.reducer';
import * as usersState from './user/user.reducer';
import * as eventState from './event/event.reducer';
import * as leavesState from './leave/leave.reducer';
import * as projectState from './project/project.reducer';
import * as activityState from './activity/activity.reducer';
import * as calendarState from './calendar/calendar.reducer';
import * as settingsState from './settings/settings.reducer';
import * as taskState from './task/tasks-management.reducer';
import * as customersState from './customer/customer.reducer';

import { environment } from '../../../environments/environment';
import { getSelectedCalendar } from './calendar';
import { getEventsList } from './event';
import { CalendarDetails } from '../../shared/models';
import { selectUserSession } from './auth';
import * as notificationsState from './notifications/notifications.reducer';

export interface AppState {
  [authState.authReducerKey]: authState.AuthState;
  [taskState.tasksReducerKey]: taskState.TasksState;
  [usersState.usersReducerKey]: usersState.UsersState;
  [eventState.eventReducerKey]: eventState.EventsState;
  [leavesState.leavesReducerKey]: leavesState.LeavesState;
  [projectState.projectReducerKey]: projectState.ProjectState;
  [activityState.activityReducerKey]: activityState.ActivityState;
  [calendarState.calendarReducerKey]: calendarState.CalendarState;
  [settingsState.settingsReducerKey]: settingsState.SettingsState;
  [customersState.customersReducerKey]: customersState.CustomersState;
  [notificationsState.notificationsReducerKey]: notificationsState.NotificationsState;
}

export const reducers: ActionReducerMap<AppState> = {
  [authState.authReducerKey]: authState.reducer,
  [taskState.tasksReducerKey]: taskState.reducer,
  [eventState.eventReducerKey]: eventState.reducer,
  [usersState.usersReducerKey]: usersState.reducer,
  [leavesState.leavesReducerKey]: leavesState.reducer,
  [projectState.projectReducerKey]: projectState.reducer,
  [activityState.activityReducerKey]: activityState.reducer,
  [calendarState.calendarReducerKey]: calendarState.reducer,
  [settingsState.settingsReducerKey]: settingsState.reducer,
  [customersState.customersReducerKey]: customersState.reducer,
  [notificationsState.notificationsReducerKey]: notificationsState.reducer,

};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];

export const getSelectedCalendarDetails = createSelector(
  getSelectedCalendar,
  getEventsList,
  selectUserSession,
  (calendar, events, userSession): CalendarDetails => {
    return {
      ...calendar,
      userPermission: {
        canDelete: userSession?.userId === calendar?.userId && calendar?.isPrivate,
        canUpdateVisibility: userSession?.userId === calendar?.userId && !events?.find(event => event?.calendarId === calendar?.id && event?.creator !== userSession?.userId),
      },
    };
  },
);
