import { LeavesState } from '../leave.reducer';
import { getFilteredLeavesList, getLeavesDetailsList, getLeavesList, getSelectedLeave, getSelectedLeaveDetails, getUserLeavesDetailsList } from '..';

import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { LeaveDetails, UserDetailedPermissions } from '../../../../shared/models';

// FIXME: spec miss the negative tests: user with no leaves and leaves with no user in list
// FIXME: spec miss the borders tests: no leaves, no users, the expected the result!
describe('Leaves state', () => {
  const initialLeavesState: LeavesState = {
    leavesList: [],
    selectedLeave: undefined,
    error: undefined,
    loadingAction: false,
  };
  const leaveA: LeaveDetails = {
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
    userName: '',
    isActiveUser: true,
  };
  const leaveB: LeaveDetails = {
    id: 2,
    start: new Date(2021, 10, 1),
    isHalfDayStart: false,
    end: new Date(2021, 10, 10),
    isHalfDayEnd: false,
    userId: 2,
    leaveType: LeaveType.Sick,
    description: '',
    state: LeaveState.InProgress,
    comment: '',
    userName: '',
    isActiveUser: false,
  };
  const stateData = {
    workspaceId: 1,
    userId: 1,
    token: 'ABC',
    globalRoles: ['Administrator'],
  };

  it('Should select the leaves list', () => {
    let result = getLeavesList.projector(initialLeavesState);
    expect(result).toEqual([]);
    result = getLeavesList.projector({
      ...initialLeavesState,
      leavesList: [leaveA, leaveB],
    });

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual(leaveA);
    expect(result[1]).toEqual(leaveB);
  });

  it('Should select the selected leave', () => {
    let result = getSelectedLeave.projector(initialLeavesState);
    expect(result).toEqual(undefined);

    const state = {
      leavesList: [leaveA, leaveB],
      selectedLeave: leaveA,
      error: undefined,
    };
    result = getSelectedLeave.projector(state);
    expect(result).toEqual(leaveA);
  });

  it('Should select the leaves details list', () => {
    let result = getLeavesDetailsList.projector([], [], {});
    expect(result.length).toEqual(0);

    result = getLeavesDetailsList.projector(
      [
        { ...leaveA, start: new Date(2020, 10, 1), end: new Date(2020, 10, 5) },
        { ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10) },
      ],
      [
        {
          id: 1,
          firstName: 'Doe',
          lastName: 'John',
          login: 'admin',
          email: 'admin@gmail.com',
          note: 'the user note',
          isActive: true,
          fullName: 'Doe John',
          userPermissions: { canEdit: true, seeRoles: false, canDelete: true },
        },
        {
          id: 2,
          firstName: 'Joe',
          lastName: 'Jackie',
          login: 'supervisor',
          email: 'supervisor@gmail.com',
          note: 'the user note',
          isActive: false,
          fullName: 'Joe Jackie',
          userPermissions: { canEdit: true, seeRoles: false, canDelete: true },
        },
      ],
      stateData,
    );

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({ ...leaveA, start: new Date(2020, 10, 1), end: new Date(2020, 10, 5), userName: 'Doe John', editPermission: { canEdit: true } });
    expect(result[1]).toEqual({ ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), userName: 'Joe Jackie', editPermission: { canEdit: true } });
  });

  it('Should select the user leaves details list', () => {
    let result = getUserLeavesDetailsList.projector([], null);
    expect(result.length).toEqual(0);

    result = getUserLeavesDetailsList.projector(
      [
        { ...leaveA, start: new Date(2020, 7, 1), end: new Date(2020, 7, 7), userName: 'Doe John', editPermission: { canEdit: true } },
        { ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), userName: 'Joe Jackie', editPermission: { canEdit: true } },
      ],
      stateData,
    );

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({ ...leaveA, start: new Date(2020, 7, 1), end: new Date(2020, 7, 7), userName: 'Doe John', editPermission: { canEdit: true } });
    expect(result[1]).toEqual({ ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), userName: 'Joe Jackie', editPermission: { canEdit: true } });

    result = getUserLeavesDetailsList.projector(
      [
        { ...leaveA, start: new Date(2020, 7, 1), end: new Date(2020, 7, 7), userName: 'Doe John', editPermission: { canEdit: true } },
        { ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), userName: 'Joe Jackie', editPermission: { canEdit: true } },
      ],
      { ...stateData, userId: 2, globalRoles: [] },
    );

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual({ ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), userName: 'Joe Jackie', editPermission: { canEdit: true } });
  });

  it('Should select the filtered leaves list', () => {
    const johnDoe: UserDetailedPermissions = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      login: 'admin',
      email: 'admin@gmail.com',
      note: 'the user note',
      isActive: true,
      fullName: 'Doe John',
      globalRoles: [],
      userPermissions: {
        canEdit: true,
        seeRoles: true,
        canDelete: true,
      },
    };
    const jackieJoe: UserDetailedPermissions = {
      id: 2,
      firstName: 'Jackie',
      lastName: 'Joe',
      login: 'lead',
      email: 'lead@gmail.com',
      note: 'the user note',
      isActive: false,
      fullName: 'Joe Jackie',
      globalRoles: [],
      userPermissions: {
        canEdit: false,
        seeRoles: true,
        canDelete: false,
      },
    };
    let result = getFilteredLeavesList.projector([], []);
    expect(result.length).toEqual(0);

    result = getFilteredLeavesList.projector(
      [
        { ...leaveA, start: new Date(2020, 7, 1), end: new Date(2020, 7, 7), isHalfDayStart: false, isHalfDayEnd: false, userName: 'Doe John', editPermission: { canEdit: true } },
        { ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), userName: 'Joe Jackie', editPermission: { canEdit: true } },
      ],
      [johnDoe, jackieJoe],
    );

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({
      ...leaveA,
      start: new Date(2020, 7, 1),
      end: new Date(2020, 7, 7),
      isHalfDayStart: false,
      isHalfDayEnd: false,
      userName: 'Doe John',
      editPermission: { canEdit: true },
    });
    expect(result[1]).toEqual({ ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), userName: 'Joe Jackie', editPermission: { canEdit: true } });

    result = getFilteredLeavesList.projector(
      [
        { ...leaveA, start: new Date(2020, 7, 1), end: new Date(2020, 7, 7), isHalfDayStart: false, isHalfDayEnd: false, userName: 'Doe John', editPermission: { canEdit: true } },
        { ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), state: LeaveState.Approved, userName: 'Joe Jackie', editPermission: { canEdit: true } },
      ],
      [johnDoe, jackieJoe],
    );

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({
      ...leaveA,
      start: new Date(2020, 7, 1),
      end: new Date(2020, 7, 7),
      isHalfDayStart: false,
      isHalfDayEnd: false,
      userName: 'Doe John',
      editPermission: { canEdit: true },
    });
    expect(result[1]).toEqual({
      ...leaveB,
      start: new Date(2020, 10, 1),
      end: new Date(2021, 10, 10),
      state: LeaveState.Approved,
      userName: 'Joe Jackie',
      editPermission: { canEdit: true },
    });

    result = getFilteredLeavesList.projector(
      [
        { ...leaveA, start: new Date(2020, 7, 1), end: new Date(2020, 7, 7), isHalfDayStart: false, isHalfDayEnd: false, userName: 'Doe John', editPermission: { canEdit: true } },
        { ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), state: LeaveState.Canceled, userName: 'Joe Jackie', editPermission: { canEdit: true } },
      ],
      [johnDoe, jackieJoe],
    );

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual({
      ...leaveA,
      start: new Date(2020, 7, 1),
      end: new Date(2020, 7, 7),
      isHalfDayStart: false,
      isHalfDayEnd: false,
      userName: 'Doe John',
      editPermission: { canEdit: true },
    });

    result = getFilteredLeavesList.projector(
      [
        { ...leaveA, start: new Date(2020, 7, 1), end: new Date(2020, 7, 7), isHalfDayStart: false, isHalfDayEnd: false, userName: 'Doe John', editPermission: { canEdit: true } },
        { ...leaveB, start: new Date(2020, 10, 1), end: new Date(2021, 10, 10), state: LeaveState.Refused, userName: 'Joe Jackie', editPermission: { canEdit: true } },
      ],
      [johnDoe, jackieJoe],
    );

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual({
      ...leaveA,
      start: new Date(2020, 7, 1),
      end: new Date(2020, 7, 7),
      isHalfDayStart: false,
      isHalfDayEnd: false,
      userName: 'Doe John',
      editPermission: { canEdit: true },
    });
  });

  it('Should select the selected leave details', () => {
    const result = getSelectedLeaveDetails.projector({ ...leaveA, userName: 'Doe John' }, stateData);
    expect(result).toEqual({
      ...leaveA,
      userName: 'Doe John',
      editPermission: {
        canEdit: true,
        canEditData: true,
        canEditStatus: true,
        canEditDescription: true,
      },
    });
  });
});
