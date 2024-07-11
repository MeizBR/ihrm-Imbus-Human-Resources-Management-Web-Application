import { initialCalendarState } from '../calendar.reducer';
import {
  getCalendarFilters,
  getCalendarList,
  getCalendarsDetailsList,
  getCalendarsError,
  getCalendarsInFilters,
  getCalendarsList,
  getCalendarsLoading,
  getFilteredCalendars,
  getFilteredUsersLeaves,
  getPublicCalendarList,
  getUsersLeavesInFilters,
} from '..';

import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CalendarDetails, CalendarFilter } from '../../../../shared/models';

describe('Calendars state', () => {
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
    name: 'Calendar N° 2',
    description: 'Description',
    isPrivate: true,
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
  it('Should select the calendars list', () => {
    let result = getCalendarList.projector(initialCalendarState);
    expect(result).toEqual(undefined);
    result = getCalendarList.projector({ initialCalendarState, calendarsList: [calendarA, calendarB] });

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual(calendarA);
    expect(result[1]).toEqual(calendarB);
  });

  it('Should select the public calendars list', () => {
    let result = getPublicCalendarList.projector(initialCalendarState);
    expect(result).toEqual(undefined);
    result = getPublicCalendarList.projector({ initialCalendarState, calendarsList: [calendarA, calendarB] });

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(calendarA);
  });

  it('Should select the detailed calendars list', () => {
    const projectsList = [
      {
        id: 1,
        customerId: 1,
        name: 'Projet A1',
        description: 'New description',
        isActive: true,
      },
      {
        id: 2,
        customerId: 2,
        name: 'Projet B1',
        description: 'New description',
        isActive: true,
      },
    ];

    let result = getCalendarsDetailsList.projector([calendarA, calendarB], [], null);
    expect(result).toEqual([
      {
        id: 1,
        project: 1,
        projectName: undefined,
        isActiveProject: undefined,
        name: 'Calendar N° 1',
        description: 'Description',
        isPrivate: false,
        userId: 1,
        timeZone: 'Africa/Tunis',
        userPermission: { canEdit: false, canDelete: false },
      },
      {
        id: 2,
        project: 2,
        projectName: undefined,
        isActiveProject: undefined,
        name: 'Calendar N° 2',
        description: 'Description',
        isPrivate: true,
        userId: 2,
        timeZone: 'Africa/Tunis',
        userPermission: { canEdit: false, canDelete: false },
      },
    ]);

    result = getCalendarsDetailsList.projector([{ ...calendarA, isPrivate: true }, calendarB], projectsList, {
      workspaceId: 1,
      userId: 1,
      token: 'ABCD',
      globalRoles: ['Administrator'],
    });

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({
      id: 1,
      project: 1,
      projectName: 'Projet A1',
      isActiveProject: true,
      name: 'Calendar N° 1',
      description: 'Description',
      isPrivate: true,
      userId: 1,
      timeZone: 'Africa/Tunis',
      userPermission: { canEdit: true, canDelete: true },
    });
    expect(result[1]).toEqual({
      id: 2,
      project: 2,
      projectName: 'Projet B1',
      isActiveProject: true,
      name: 'Calendar N° 2',
      description: 'Description',
      isPrivate: true,
      userId: 2,
      timeZone: 'Africa/Tunis',
      userPermission: { canEdit: true, canDelete: false },
    });

    result = getCalendarsDetailsList.projector([calendarA, calendarB], projectsList, {
      workspaceId: 1,
      userId: 1,
      token: 'ABCD',
      globalRoles: [],
    });

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({
      id: 1,
      project: 1,
      projectName: 'Projet A1',
      isActiveProject: true,
      name: 'Calendar N° 1',
      description: 'Description',
      isPrivate: false,
      userId: 1,
      timeZone: 'Africa/Tunis',
      userPermission: { canEdit: true, canDelete: false },
    });
    expect(result[1]).toEqual({
      id: 2,
      project: 2,
      projectName: 'Projet B1',
      isActiveProject: true,
      name: 'Calendar N° 2',
      description: 'Description',
      isPrivate: true,
      userId: 2,
      timeZone: 'Africa/Tunis',
      userPermission: { canEdit: false, canDelete: false },
    });
  });

  it('Should select the user detailed calendars list', () => {
    let result = getCalendarsList.projector([calendarA, calendarB], {
      workspaceId: 1,
      userId: 1,
      token: 'ABCD',
      globalRoles: ['Administrator'],
    });

    expect(result).toEqual([calendarA, calendarB]);

    result = getCalendarsList.projector([calendarA, calendarB], {
      workspaceId: 1,
      userId: 1,
      token: 'ABCD',
      globalRoles: [],
    });

    expect(result).toEqual([calendarA]);
  });

  it('Should select the calendars error', () => {
    let result = getCalendarsError.projector(initialCalendarState);
    expect(result).toEqual(undefined);

    result = getCalendarsError.projector({ initialCalendarState, calendarsList: [calendarA, calendarB], error: ErrorType.NameAlreadyExists });

    expect(result).toEqual('NameAlreadyExists');
  });

  it('Should select the public calendars error', () => {
    let result = getCalendarsLoading.projector(initialCalendarState);
    expect(result).toEqual(false);

    result = getCalendarsLoading.projector({
      initialCalendarState,
      calendarsList: [calendarA, calendarB],
      error: ErrorType.NameAlreadyExists,
      loadingAction: true,
    });

    expect(result).toEqual(true);
  });

  it('Should select the calendars filter', () => {
    let result = getCalendarFilters.projector(initialCalendarState);
    expect(result).toEqual(undefined);

    result = getCalendarFilters.projector({
      initialCalendarState,
      calendarFilters,
    });

    expect(result).toEqual(calendarFilters);
  });

  it('Should select the calendars events in filter', () => {
    let result = getFilteredCalendars.projector(undefined);
    expect(result).toEqual(undefined);

    result = getFilteredCalendars.projector(calendarFilters);

    expect(result).toEqual([
      {
        calendarId: 1,
        calendarName: 'Calendar 1',
        isChecked: true,
      },
    ]);
  });

  it('Should select the users leaves in filter', () => {
    let result = getFilteredUsersLeaves.projector(undefined);
    expect(result).toEqual(undefined);

    result = getFilteredUsersLeaves.projector({
      usersLeavesFilter: [
        {
          userId: 1,
          userName: 'John Dao',
          isChecked: true,
        },
      ],
      calendarEventsFilter: [
        {
          calendarId: 1,
          calendarName: 'Calendar 1',
          isChecked: true,
        },
      ],
    });

    expect(result).toEqual(calendarFilters.usersLeavesFilter);
  });

  it('Should select the filtered calendars events', () => {
    const result = getCalendarsInFilters.projector([calendarA, calendarB], calendarFilters);

    expect(result).toEqual([
      {
        calendarId: 1,
        calendarName: 'Calendar N° 1',
        isChecked: true,
      },
      {
        calendarId: 2,
        calendarName: 'Calendar N° 2',
        isChecked: undefined,
      },
    ]);
  });

  it('Should select the filtered users leaves', () => {
    const result = getUsersLeavesInFilters.projector(
      [
        {
          id: 1,
          start: new Date(2020, 8, 1),
          isHalfDayStart: true,
          end: new Date(2020, 8, 5),
          isHalfDayEnd: true,
          userId: 1,
          leaveType: LeaveType.Holiday,
          description: '',
          state: LeaveState.Pending,
          comment: '',
          userName: 'John Dao',
        },
        {
          id: 2,
          start: new Date(2021, 9, 2),
          isHalfDayStart: false,
          end: new Date(2021, 9, 3),
          isHalfDayEnd: true,
          userId: 2,
          leaveType: LeaveType.Sick,
          description: '',
          state: LeaveState.InProgress,
          comment: '',
          userName: 'Jackie Joe',
        },
      ],
      calendarFilters,
      [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Dao',
          login: 'dao.john',
          email: 'dao.john@gmail.com',
          note: 'the user note',
          isActive: true,
          fullName: 'John Dao',
          globalRoles: [],
          userPermissions: [
            {
              canEdit: true,
              seeRoles: true,
              canDelete: true,
            },
          ],
        },
        {
          id: 2,
          firstName: 'Jackie',
          lastName: 'Joe',
          login: 'joe.jackie',
          email: 'joe.jackie@gmail.com',
          note: 'the user note',
          isActive: true,
          fullName: 'Jackie Joe',
          globalRoles: [],
          userPermissions: [
            {
              canEdit: true,
              seeRoles: true,
              canDelete: true,
            },
          ],
        },
      ],
    );

    expect(result).toEqual([
      {
        userId: 1,
        userName: 'John Dao',
        isChecked: true,
      },
      {
        userId: 2,
        userName: 'Jackie Joe',
        isChecked: undefined,
      },
    ]);
  });
});
