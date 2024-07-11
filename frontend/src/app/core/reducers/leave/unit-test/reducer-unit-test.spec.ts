import * as fromReducer from '../leave.reducer';
import { leavesActions } from '../leave.actions';

import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { LeaveDetails } from '../../../../shared/models/leave-models/leave-details';

describe('Leave reducer', () => {
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
    userName: 'Doe John',
  };
  const leaveB: LeaveDetails = {
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
    userName: 'Joe Jackie',
  };
  const startingLeavesState: fromReducer.LeavesState = { leavesList: [], selectedLeave: undefined, error: undefined, loadingAction: false };
  describe('An unknown action', () => {
    it('should return the default state', () => {
      const state = fromReducer.reducer(fromReducer.initialLeavesState, { type: undefined });

      expect(state).toBe(fromReducer.initialLeavesState);
    });
  });

  describe('Dispatch actions', () => {
    it('should load all leave and update the state in an immutable way', () => {
      const newState: fromReducer.LeavesState = { leavesList: [leaveA, leaveB], selectedLeave: undefined, error: undefined, loadingAction: false };
      const state = fromReducer.reducer(fromReducer.initialLeavesState, leavesActions.loadAllLeavesActionSuccess({ leavesList: [leaveA, leaveB] }));

      expect(state).toEqual(newState);
    });

    it('should load the selected leave details and update the state in an immutable way', () => {
      const state = fromReducer.reducer({ ...startingLeavesState, leavesList: [leaveA, leaveB] }, leavesActions.loadLeaveDetailsActionSuccess({ leave: leaveA }));
      expect(state).toEqual({ ...startingLeavesState, leavesList: [leaveA, leaveB], selectedLeave: leaveA });
    });

    it('should add new leave and update the state in an immutable way', () => {
      const state = fromReducer.reducer({ ...startingLeavesState, leavesList: [leaveA] }, leavesActions.addLeaveActionSuccess({ leave: leaveB }));
      expect(state).toEqual({ ...startingLeavesState, leavesList: [leaveA, leaveB] });
    });

    it('should update an existing leave data and update the state in an immutable way', () => {
      const initialLeavesState: fromReducer.LeavesState = {
        leavesList: [
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
            userName: 'Doe John',
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
            userName: 'Joe Jackie',
          },
        ],
        selectedLeave: undefined,
        error: undefined,
        loadingAction: false,
      };
      let state = fromReducer.reducer(initialLeavesState, { type: undefined });

      expect(state).toEqual(initialLeavesState);

      const newState: fromReducer.LeavesState = {
        leavesList: [
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
            userName: 'Doe John',
          },
          {
            id: 2,
            start: new Date(2021, 9, 3),
            isHalfDayStart: false,
            end: new Date(2021, 9, 4),
            isHalfDayEnd: true,
            userId: 2,
            leaveType: LeaveType.Sick,
            description: 'New description',
            state: LeaveState.InProgress,
            comment: '',
            userName: 'Joe Jackie',
          },
        ],
        selectedLeave: {
          id: 2,
          start: new Date(2021, 9, 3),
          isHalfDayStart: false,
          end: new Date(2021, 9, 4),
          isHalfDayEnd: true,
          userId: 2,
          leaveType: LeaveType.Sick,
          description: 'New description',
          state: LeaveState.InProgress,
          comment: '',
          userName: 'Joe Jackie',
        },
        error: undefined,
        loadingAction: false,
      };
      state = fromReducer.reducer(
        initialLeavesState,
        leavesActions.updateLeaveActionSuccess({
          leave: {
            id: 2,
            start: new Date(2021, 9, 3),
            isHalfDayStart: false,
            end: new Date(2021, 9, 4),
            isHalfDayEnd: true,
            userId: 2,
            leaveType: LeaveType.Sick,
            description: 'New description',
            state: LeaveState.InProgress,
            comment: '',
            userName: 'Joe Jackie',
          },
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should update an existing leave state and comment and update the state in an immutable way', () => {
      const initialLeavesState: fromReducer.LeavesState = {
        leavesList: [
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
            userName: 'Doe John',
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
            userName: 'Joe Jackie',
          },
        ],
        selectedLeave: undefined,
        error: undefined,
        loadingAction: false,
      };
      let state = fromReducer.reducer(initialLeavesState, { type: undefined });

      expect(state).toEqual(initialLeavesState);

      const newState: fromReducer.LeavesState = {
        leavesList: [
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
            userName: 'Doe John',
          },
          {
            id: 2,
            start: new Date(2021, 9, 3),
            isHalfDayStart: false,
            end: new Date(2021, 9, 4),
            isHalfDayEnd: true,
            userId: 2,
            leaveType: LeaveType.Sick,
            description: '',
            state: LeaveState.Approved,
            comment: 'This leave is approved',
            userName: 'Joe Jackie',
          },
        ],
        selectedLeave: {
          id: 2,
          start: new Date(2021, 9, 3),
          isHalfDayStart: false,
          end: new Date(2021, 9, 4),
          isHalfDayEnd: true,
          userId: 2,
          leaveType: LeaveType.Sick,
          description: '',
          state: LeaveState.Approved,
          comment: 'This leave is approved',
          userName: 'Joe Jackie',
        },
        error: undefined,
        loadingAction: false,
      };
      state = fromReducer.reducer(
        initialLeavesState,
        leavesActions.updateLeaveActionSuccess({
          leave: {
            id: 2,
            start: new Date(2021, 9, 3),
            isHalfDayStart: false,
            end: new Date(2021, 9, 4),
            isHalfDayEnd: true,
            userId: 2,
            leaveType: LeaveType.Sick,
            description: '',
            state: LeaveState.Approved,
            comment: 'This leave is approved',
            userName: 'Joe Jackie',
          },
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should reset the state in an immutable way', () => {
      const initialLeavesState: fromReducer.LeavesState = {
        leavesList: [
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
            userName: 'Doe John',
          },
          {
            id: 2,
            start: new Date(2021, 9, 3),
            isHalfDayStart: false,
            end: new Date(2021, 9, 4),
            isHalfDayEnd: true,
            userId: 2,
            leaveType: LeaveType.Sick,
            description: '',
            state: LeaveState.Approved,
            comment: 'This leave is approved',
            userName: 'Joe Jackie',
          },
        ],
        selectedLeave: {
          id: 2,
          start: new Date(2021, 9, 3),
          isHalfDayStart: false,
          end: new Date(2021, 9, 4),
          isHalfDayEnd: true,
          userId: 2,
          leaveType: LeaveType.Sick,
          description: '',
          state: LeaveState.Approved,
          comment: 'This leave is approved',
          userName: 'Joe Jackie',
        },
        error: undefined,
        loadingAction: false,
      };
      let state = fromReducer.reducer(initialLeavesState, { type: undefined });

      expect(state).toEqual(initialLeavesState);

      const newState: fromReducer.LeavesState = { leavesList: undefined, selectedLeave: undefined, error: undefined, loadingAction: undefined };
      state = fromReducer.reducer(initialLeavesState, leavesActions.ResetLeaveStateAction());

      expect(state).toEqual(newState);
    });
  });
});
