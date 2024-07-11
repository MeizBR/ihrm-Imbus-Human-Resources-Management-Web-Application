import { createSelector } from '@ngrx/store';

import { uniqBy } from 'lodash';

import { AppState } from '..';
import { mappedUsersList } from '../user';
import { selectUserSession } from '../auth';
import { selectProjectsList } from '../project';
import { getFilteredLeavesList } from '../leave';
import * as calendarReducer from '../calendar/calendar.reducer';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { CalendarDetails, LeaveDetails } from '../../../shared/models/index';

export const selectFeature = (state: AppState) => state[calendarReducer.calendarReducerKey];
export const getCalendarList = createSelector(selectFeature, state => state.calendarsList);
export const getCalendarsError = createSelector(selectFeature, state => state.error);
export const getCalendarsLoading = createSelector(selectFeature, state => state.loadingAction);
export const getSelectedCalendar = createSelector(selectFeature, state => state.selectedCalendar);

export const getPublicCalendarList = createSelector(selectFeature, state => state.calendarsList && state.calendarsList.filter((calendar: CalendarDetails) => !calendar.isPrivate));
export const getCalendarsDetailsList = createSelector(getCalendarList, selectProjectsList, selectUserSession, (calendars, projects, userSession): CalendarDetails[] =>
  calendars?.map(calendar => ({
    ...calendar,
    projectName: projects?.find(project => project?.id === calendar?.project)?.name,
    isActiveProject: projects?.find(project => project?.id === calendar?.project)?.isActive,
    userPermission: {
      canEdit: userSession?.globalRoles.includes(RoleModel.Administrator) || calendar?.userId === userSession?.userId,
      canDelete: userSession?.userId === calendar?.userId && calendar?.isPrivate,
    },
  })),
);

export const getCalendarFilters = createSelector(selectFeature, state => state.calendarFilters);
export const getFilteredCalendars = createSelector(getCalendarFilters, calendars => calendars?.calendarsListFilter?.filter(cal => cal.isChecked));
export const getFilteredUsersLeaves = createSelector(getCalendarFilters, calendars => calendars?.usersLeavesFilter?.filter(userLeaves => userLeaves.isChecked));
export const getCalendarsInFilters = createSelector(getCalendarList, getCalendarFilters, (calendars, filters) =>
  calendars?.map(c => ({
    calendarId: c.id,
    calendarName: c.name,
    isChecked: filters?.calendarsListFilter?.find(f => f.calendarId === c.id)?.isChecked,
  })),
);

// NOTE: Deleted users handling to be improved after implementing the effect of removing users on leave
export const getUsersLeavesInFilters = createSelector(getFilteredLeavesList, getCalendarFilters, mappedUsersList, (leaves, filters, users) =>
  uniqBy(
    leaves
      // tslint:disable-next-line: max-line-length
      ?.filter(leave => users?.find(user => user.id === leave.userId)) // FIXME: To be deleted after the backend fix (Get leaves should return leaves of existing users not the deleted one)
      ?.map((leave: LeaveDetails) => ({
        userId: leave.userId,
        userName: leave.userName,
        isChecked: filters?.usersLeavesFilter?.find(f => f.userId === leave.userId)?.isChecked,
      })),
    'userId',
  ),
);

export const getCalendarsList = createSelector(getCalendarList, selectUserSession, (calendars, userSession): CalendarDetails[] =>
  userSession?.globalRoles.includes(RoleModel.Administrator) ? calendars : calendars?.filter(calendar => calendar.userId === userSession?.userId),
);
