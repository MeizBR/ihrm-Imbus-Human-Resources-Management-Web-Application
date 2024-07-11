import * as fromReducer from '../calendar.reducer';
import { calendarsActions } from '../calendar.actions';

import { CalendarDetails, CalendarFilter } from '../../../../shared/models';

describe('Calendar reducer', () => {
  const calendarA: CalendarDetails = {
    id: 1,
    project: 1,
    name: 'Calendar N° 1',
    description: 'Description',
    isPrivate: false,
    userId: 1,
    timeZone: 'Africa/Tunis',
  };
  const calendarB: CalendarDetails = {
    id: 2,
    project: 2,
    projectName: 'Projet B1',
    name: 'Calendar N° 2',
    description: 'Description',
    isPrivate: false,
    userId: 2,
    timeZone: 'Africa/Tunis',
  };

  const calendarFilters: CalendarFilter = {
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

  let initialCalendarState: fromReducer.CalendarState;

  describe('An unknown action', () => {
    it('should return the default state', () => {
      const state = fromReducer.reducer(fromReducer.initialCalendarState, { type: undefined });

      expect(state).toBe(fromReducer.initialCalendarState);
    });
  });

  describe('Calendars managements actions', () => {
    initialCalendarState = {
      calendarsList: [calendarA],
      calendarFilters: undefined,
      selectedCalendar: calendarA,
      error: undefined,
      loadingAction: false,
    };

    it('should load all calendars and update the state in an immutable way', () => {
      const newState: fromReducer.CalendarState = {
        calendarsList: [calendarA, calendarB],
        calendarFilters: undefined,
        selectedCalendar: undefined,
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(fromReducer.initialCalendarState, calendarsActions.loadAllCalendarsActionSuccess({ calendarsList: [calendarA, calendarB] }));

      expect(state).toEqual(newState);
    });

    it('should add new calendar and update the state in an immutable way', () => {
      const newState: fromReducer.CalendarState = {
        calendarsList: [calendarA, calendarB],
        calendarFilters: undefined,
        selectedCalendar: calendarA,
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(initialCalendarState, calendarsActions.addCalendarActionSuccess({ addedCalendar: calendarB }));
      expect(state).toEqual(newState);
    });

    it('should update an existing calendar and update the state in an immutable way', () => {
      initialCalendarState = {
        calendarsList: [calendarA],
        calendarFilters: undefined,
        selectedCalendar: calendarA,
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.CalendarState = {
        calendarsList: [
          {
            ...calendarA,
            description: 'New Description',
            isPrivate: true,
          },
        ],
        calendarFilters: undefined,
        error: undefined,
        loadingAction: false,
        selectedCalendar: {
          ...calendarA,
          description: 'New Description',
          isPrivate: true,
        },
      };
      const state = fromReducer.reducer(
        initialCalendarState,
        calendarsActions.updateCalendarSuccessAction({
          updatedCalendar: { ...calendarA, description: 'New Description', isPrivate: true },
        }),
      );
      expect(state).toEqual(newState);
    });

    it('should set the calendar filter and update the state in an immutable way', () => {
      initialCalendarState = {
        calendarsList: [calendarA],
        calendarFilters: undefined,
        selectedCalendar: calendarA,
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.CalendarState = {
        calendarsList: [calendarA],
        calendarFilters,
        error: undefined,
        loadingAction: false,
        selectedCalendar: calendarA,
      };
      const state = fromReducer.reducer(initialCalendarState, calendarsActions.setCalendarsFilterListAction({ filterList: calendarFilters }));
      expect(state).toEqual(newState);
    });

    it('should update the calendar events filter and update the state in an immutable way', () => {
      const newState: fromReducer.CalendarState = {
        calendarsList: [calendarA],
        calendarFilters: {
          ...calendarFilters,
          calendarsListFilter: [
            {
              calendarId: 1,
              calendarName: 'Calendar 1',
              isChecked: false,
            },
          ],
        },
        error: undefined,
        loadingAction: false,
        selectedCalendar: calendarA,
      };
      const state = fromReducer.reducer(
        {
          calendarsList: [calendarA],
          calendarFilters,
          selectedCalendar: calendarA,
          error: undefined,
          loadingAction: false,
        },
        calendarsActions.updateCalendarsFilterListAction({
          updatedFilter: {
            calendarId: 1,
            calendarName: 'Calendar 1',
            isChecked: false,
          },
        }),
      );
      expect(state).toEqual(newState);
    });

    it('should update the users leaves filter and update the state in an immutable way', () => {
      const newState: fromReducer.CalendarState = {
        calendarsList: [calendarA],
        calendarFilters: {
          ...calendarFilters,
          usersLeavesFilter: [
            {
              userId: 1,
              userName: 'John Dao',
              isChecked: false,
            },
          ],
        },
        error: undefined,
        loadingAction: false,
        selectedCalendar: calendarA,
      };
      const state = fromReducer.reducer(
        {
          calendarsList: [calendarA],
          calendarFilters,
          selectedCalendar: calendarA,
          error: undefined,
          loadingAction: false,
        },
        calendarsActions.updateUsersLeavesFilterListAction({
          updatedFilter: {
            userId: 1,
            userName: 'John Dao',
            isChecked: false,
          },
        }),
      );
      expect(state).toEqual(newState);
    });

    it('should delete an existing calendar and update the state in an immutable way', () => {
      let state = fromReducer.reducer(initialCalendarState, { type: undefined });

      expect(state).toEqual(initialCalendarState);

      const newState: fromReducer.CalendarState = { calendarsList: [], calendarFilters: undefined, selectedCalendar: undefined, error: undefined, loadingAction: false };
      state = fromReducer.reducer(initialCalendarState, calendarsActions.deleteCalendarSuccessAction({ id: 1 }));

      expect(state).toEqual(newState);
    });
  });
});
