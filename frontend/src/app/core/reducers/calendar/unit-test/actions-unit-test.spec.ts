import { ActionTypes, calendarsActions } from '../../../reducers/calendar/calendar.actions';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CalendarFilter, CalendarsListFilter, CalendarToAdd, CalendarToUpdate, UsersLeavesFilter } from '../../../../shared/models/index';

describe('Calendar actions', () => {
  const calendarA = {
    id: 1,
    project: 1,
    projectName: 'Projet A1',
    name: 'Calendar N° 1',
    description: 'Description',
    isPrivate: false,
    userId: 1,
    timeZone: 'Africa/Tunis',
    eventChecked: true,
    leaveChecked: true,
  };
  const calendarB = {
    id: 2,
    project: 2,
    projectName: 'Projet B1',
    name: 'Calendar N° 2',
    description: 'Description',
    isPrivate: true,
    userId: 2,
    timeZone: 'Africa/Tunis',
    eventChecked: true,
    leaveChecked: true,
  };

  describe('Load calendars actions', () => {
    it('should create loadAllCalendarsAction action', () => {
      const action = calendarsActions.loadAllCalendarsAction();
      expect(action).toEqual({ type: ActionTypes.LOAD_ALL_CALENDARS });
    });

    it('should create loadAllCalendarsActionSuccess action', () => {
      const action = calendarsActions.loadAllCalendarsActionSuccess({ calendarsList: [calendarA, calendarB] });

      expect(action).toEqual({ calendarsList: [calendarA, calendarB], type: ActionTypes.LOAD_ALL_CALENDARS_SUCCESS });
    });
  });

  describe('Add calendar actions', () => {
    it('should create addCalendarAction action', () => {
      const payload: CalendarToAdd = {
        project: 1,
        name: 'Calendar N° 1',
        description: 'Description',
        isPrivate: false,
        timeZone: 'Africa/Tunis',
      };
      const action = calendarsActions.addCalendarAction({ calendarToAdd: payload });
      expect(action).toEqual({ calendarToAdd: payload, type: ActionTypes.ADD_CALENDAR });
    });

    it('should create addCalendarActionSuccess action', () => {
      const action = calendarsActions.addCalendarActionSuccess({ addedCalendar: calendarA });

      expect(action).toEqual({ addedCalendar: calendarA, type: ActionTypes.ADD_CALENDAR_SUCCESS });
    });
  });

  describe('Update calendar actions', () => {
    it('should create updateCalendarAction action', () => {
      const calendarToUpdate: CalendarToUpdate = {
        project: 1,
        name: 'Calendar N° 1',
        description: 'New Description',
        isPrivate: true,
        timeZone: 'Africa/Tunis',
      };
      const action = calendarsActions.updateCalendarAction({
        calendarToUpdate,
        id: 1,
      });
      expect(action).toEqual({
        calendarToUpdate,
        id: 1,
        type: ActionTypes.UPDATE_CALENDAR,
      });
    });

    it('should create updateCalendarSuccessAction action', () => {
      const action = calendarsActions.updateCalendarSuccessAction({
        updatedCalendar: calendarA,
      });

      expect(action).toEqual({
        updatedCalendar: calendarA,
        type: ActionTypes.UPDATE_CALENDAR_SUCCESS,
      });
    });
  });

  describe('Update calendar filter actions', () => {
    it('should create setCalendarsFilterListAction action', () => {
      const filterList: CalendarFilter = {
        usersLeavesFilter: [
          {
            userId: 1,
            userName: 'John Dao',
            isChecked: true,
          },
        ],
        calendarsListFilter: [
          {
            calendarId: 1,
            calendarName: 'Calendar 1',
            isChecked: true,
          },
        ],
      };
      const action = calendarsActions.setCalendarsFilterListAction({ filterList });
      expect(action).toEqual({
        filterList,
        type: ActionTypes.SET_CALENDARS_FILTER_LIST,
      });
    });

    it('should create updateCalendarEventsFilterListAction action', () => {
      const updatedFilter: CalendarsListFilter = {
        calendarId: 1,
        calendarName: 'Calendar 1',
        isChecked: true,
      };
      const action = calendarsActions.updateCalendarsFilterListAction({ updatedFilter });

      expect(action).toEqual({
        updatedFilter,
        type: ActionTypes.UPDATE_CALENDARS_FILTER_LIST,
      });
    });

    it('should create updateUsersLeavesFilterListAction action', () => {
      const updatedFilter: UsersLeavesFilter = {
        userId: 1,
        userName: 'John Dao',
        isChecked: true,
      };
      const action = calendarsActions.updateUsersLeavesFilterListAction({ updatedFilter });

      expect(action).toEqual({
        updatedFilter,
        type: ActionTypes.UPDATE_USERS_LEAVES_FILTER_LIST,
      });
    });
  });

  describe('Delete calendar actions', () => {
    it('should create deleteCalendarAction action', () => {
      const action = calendarsActions.deleteCalendarAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_CALENDAR });
    });

    it('should create deleteCalendarSuccessAction action', () => {
      const action = calendarsActions.deleteCalendarSuccessAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_CALENDAR_SUCCESS });
    });
  });

  describe('Calendar management actions', () => {
    it('should create calendarManagementFailedAction action', () => {
      const action = calendarsActions.calendarManagementFailedAction({ withSnackBarNotification: false, errorType: ErrorType.NameAlreadyExists });
      expect(action.type).toEqual(ActionTypes.CALENDARS_MANAGEMENT_FAILED);
    });
  });
});
