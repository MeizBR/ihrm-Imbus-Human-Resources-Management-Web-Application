import { createAction, props } from '@ngrx/store';

import { ErrorType } from '../../../shared/validators/validation-error-type';
import { CalendarDetails, CalendarFilter, CalendarsListFilter, CalendarToAdd, CalendarToUpdate, UsersLeavesFilter } from '../../../shared/models/index';

export enum ActionTypes {
  LOAD_ALL_CALENDARS = '[calendarManagement] Loaded Calendars',
  LOAD_ALL_CALENDARS_SUCCESS = '[calendarManagement] Loaded Calendars Success',

  LOAD_CALENDAR_DETAILS = '[calendarManagement] Loaded Calendar Details',
  LOAD_CALENDAR_DETAILS_SUCCESS = '[calendarManagement] Loaded Calendar Details Success',

  ADD_CALENDAR = '[calendarManagement] Added Calendar',
  ADD_CALENDAR_SUCCESS = '[calendarManagement] Added Calendar Success',

  UPDATE_CALENDAR = '[calendarManagement] Updated Calendar',
  UPDATE_CALENDAR_SUCCESS = '[calendarManagement] Updated Calendar Success',
  CLEAR_SELECTED_CALENDAR = '[calendarManagement] Clear Selected Calendar',

  SET_CALENDARS_FILTER_LIST = '[calendarManagement] Set Calendars Filter List',
  UPDATE_CALENDARS_FILTER_LIST = '[calendarManagement] Update Calendars Filter List',
  UPDATE_USERS_LEAVES_FILTER_LIST = '[calendarManagement] Update Users Leaves Filter List',

  DELETE_CALENDAR = '[calendarManagement] Deleted Calendar',
  DELETE_CALENDAR_SUCCESS = '[calendarManagement] Delete Calendar Success',

  CALENDARS_MANAGEMENT_FAILED = '[calendarManagement] Calendar Management Failed',

  RESET_CALENDARS_STATE = '[calendarManagement] Reset State',
}

export const calendarsActions = {
  loadAllCalendarsAction: createAction(ActionTypes.LOAD_ALL_CALENDARS),
  loadAllCalendarsActionSuccess: createAction(ActionTypes.LOAD_ALL_CALENDARS_SUCCESS, props<{ calendarsList: CalendarDetails[] }>()),

  loadCalendarDetailsAction: createAction(ActionTypes.LOAD_CALENDAR_DETAILS, props<{ calendarId: number }>()),
  loadCalendarDetailsActionSuccess: createAction(ActionTypes.LOAD_CALENDAR_DETAILS_SUCCESS, props<{ calendar: CalendarDetails }>()),

  addCalendarAction: createAction(ActionTypes.ADD_CALENDAR, props<{ calendarToAdd: CalendarToAdd }>()),
  addCalendarActionSuccess: createAction(ActionTypes.ADD_CALENDAR_SUCCESS, props<{ addedCalendar: CalendarDetails }>()),

  updateCalendarAction: createAction(ActionTypes.UPDATE_CALENDAR, props<{ calendarToUpdate: CalendarToUpdate; id: number }>()),
  updateCalendarSuccessAction: createAction(ActionTypes.UPDATE_CALENDAR_SUCCESS, props<{ updatedCalendar: CalendarDetails }>()),
  clearSelectedCalendarAction: createAction(ActionTypes.CLEAR_SELECTED_CALENDAR),

  setCalendarsFilterListAction: createAction(ActionTypes.SET_CALENDARS_FILTER_LIST, props<{ filterList: CalendarFilter }>()),
  updateCalendarsFilterListAction: createAction(ActionTypes.UPDATE_CALENDARS_FILTER_LIST, props<{ updatedFilter: CalendarsListFilter }>()),
  updateUsersLeavesFilterListAction: createAction(ActionTypes.UPDATE_USERS_LEAVES_FILTER_LIST, props<{ updatedFilter: UsersLeavesFilter }>()),

  deleteCalendarAction: createAction(ActionTypes.DELETE_CALENDAR, props<{ id: number }>()),
  deleteCalendarSuccessAction: createAction(ActionTypes.DELETE_CALENDAR_SUCCESS, props<{ id: number }>()),

  calendarManagementFailedAction: createAction(ActionTypes.CALENDARS_MANAGEMENT_FAILED, props<{ withSnackBarNotification: boolean; errorType: ErrorType }>()),

  ResetCalendarStateAction: createAction(ActionTypes.RESET_CALENDARS_STATE),
};
