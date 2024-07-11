import { Action, createReducer, on } from '@ngrx/store';

import { calendarsActions } from '../calendar/calendar.actions';

import { ErrorType } from '../../../shared/validators/validation-error-type';
import { CalendarDetails, CalendarFilter } from '../../../shared/models';

export const calendarReducerKey = 'calendarReducer';

export interface CalendarState {
  calendarsList: CalendarDetails[] | undefined;
  selectedCalendar: CalendarDetails | undefined;
  calendarFilters: CalendarFilter | undefined;
  error: ErrorType | undefined;
  loadingAction: boolean | undefined;
}

export const initialCalendarState: CalendarState = {
  calendarsList: undefined,
  selectedCalendar: undefined,
  calendarFilters: undefined,
  error: undefined,
  loadingAction: false,
};

const calendarReducer = createReducer(
  initialCalendarState,
  on(
    calendarsActions.loadAllCalendarsActionSuccess,
    (state, payload): CalendarState => ({ ...state, calendarsList: payload.calendarsList, error: undefined, loadingAction: false }),
  ),
  on(calendarsActions.loadCalendarDetailsActionSuccess, (state, payload): CalendarState => ({ ...state, selectedCalendar: payload.calendar })),

  on(calendarsActions.addCalendarAction, (state, _): CalendarState => ({ ...state, error: undefined, loadingAction: true })),
  on(
    calendarsActions.addCalendarActionSuccess,
    (state, payload): CalendarState => ({
      ...state,
      calendarsList: state.calendarsList ? [...state.calendarsList, payload.addedCalendar] : [payload.addedCalendar],
      error: undefined,
      loadingAction: false,
    }),
  ),
  on(calendarsActions.updateCalendarAction, (state, _): CalendarState => ({ ...state, error: undefined, loadingAction: true })),
  on(
    calendarsActions.updateCalendarSuccessAction,
    (state, payload): CalendarState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        calendarsList: [...state.calendarsList.map(calendar => (calendar.id === payload.updatedCalendar?.id ? payload.updatedCalendar : calendar))],
        selectedCalendar: payload.updatedCalendar,
      };
    },
  ),

  on(calendarsActions.clearSelectedCalendarAction, (state): CalendarState => ({ ...state, selectedCalendar: undefined })),

  on(
    calendarsActions.deleteCalendarAction,
    (state, _): CalendarState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    calendarsActions.deleteCalendarSuccessAction,
    (state, payload): CalendarState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        calendarsList: [...state.calendarsList.filter(calendar => calendar.id !== payload.id)],
        selectedCalendar: state.selectedCalendar?.id === payload.id ? undefined : state.selectedCalendar,
      };
    },
  ),

  on(
    calendarsActions.setCalendarsFilterListAction,
    (state, payload): CalendarState => ({
      ...state,
      calendarFilters: { usersLeavesFilter: payload.filterList.usersLeavesFilter, calendarsListFilter: payload.filterList.calendarsListFilter },
    }),
  ),

  on(
    calendarsActions.updateCalendarsFilterListAction,
    (state, payload): CalendarState => {
      const oldFilter = state.calendarFilters.calendarsListFilter?.find(filter => filter.calendarId === payload.updatedFilter.calendarId);

      return {
        ...state,
        calendarFilters: {
          ...state.calendarFilters,
          calendarsListFilter: !state.calendarFilters.calendarsListFilter
            ? [payload.updatedFilter]
            : state.calendarFilters && !oldFilter
            ? [...state.calendarFilters.calendarsListFilter, payload.updatedFilter]
            : state.calendarFilters.calendarsListFilter.map(filter =>
                filter.calendarId === payload.updatedFilter.calendarId
                  ? {
                      ...filter,
                      isChecked: payload.updatedFilter.isChecked !== undefined ? payload.updatedFilter.isChecked : filter.isChecked,
                    }
                  : filter,
              ),
        },
      };
    },
  ),

  on(
    calendarsActions.updateUsersLeavesFilterListAction,
    (state, payload): CalendarState => {
      const oldFilter = state.calendarFilters.usersLeavesFilter?.find(filter => filter.userId === payload.updatedFilter.userId);

      return {
        ...state,
        calendarFilters: {
          ...state.calendarFilters,
          usersLeavesFilter: !state.calendarFilters.usersLeavesFilter
            ? [payload.updatedFilter]
            : state.calendarFilters && !oldFilter
            ? [...state.calendarFilters.usersLeavesFilter, payload.updatedFilter]
            : state.calendarFilters.usersLeavesFilter.map(filter =>
                filter.userId === payload.updatedFilter.userId
                  ? {
                      ...filter,
                      isChecked: payload.updatedFilter.isChecked !== undefined ? payload.updatedFilter.isChecked : filter.isChecked,
                    }
                  : filter,
              ),
        },
      };
    },
  ),
  on(calendarsActions.calendarManagementFailedAction, (state, payload): CalendarState => ({ ...state, error: payload.errorType })),
  on(calendarsActions.ResetCalendarStateAction, (): CalendarState => ({ ...initialCalendarState })),
);

export function reducer(state: CalendarState | undefined, action: Action): CalendarState {
  return calendarReducer(state, action);
}
