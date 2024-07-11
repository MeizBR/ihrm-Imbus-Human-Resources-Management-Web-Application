import { ActionTypes, leavesActions } from '../../../reducers/leave/leave.actions';

import { ErrorType } from '../../../../shared/validators';
import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { LeaveDetails, LeaveToAdd, LeaveToPut, LeaveToUpdate } from '../../../../shared/models';

describe('Leave actions', () => {
  const leave: LeaveDetails = {
    id: 1,
    start: new Date(),
    isHalfDayStart: true,
    end: new Date(),
    isHalfDayEnd: true,
    userId: 1,
    leaveType: LeaveType.Holiday,
    description: '',
    state: LeaveState.Pending,
    comment: '',
    userName: '',
  };
  describe('Load leaves actions', () => {
    it('should create loadAllLeavesAction action', () => {
      const action = leavesActions.loadAllLeavesAction();
      expect(action).toEqual({ type: ActionTypes.LOAD_ALL_LEAVES });
    });

    it('should create loadAllLeavesActionSuccess action', () => {
      const action = leavesActions.loadAllLeavesActionSuccess({ leavesList: [leave] });
      expect(action).toEqual({ leavesList: [leave], type: ActionTypes.LOAD_ALL_LEAVES_SUCCESS });
    });
  });

  describe('Load leave details actions', () => {
    it('should create loadLeaveDetailsAction action', () => {
      const action = leavesActions.loadLeaveDetailsAction({ leaveId: 1 });
      expect(action).toEqual({ leaveId: 1, type: ActionTypes.LOAD_LEAVE_DETAILS });
    });

    it('should create loadLeaveDetailsActionSuccess action', () => {
      const action = leavesActions.loadLeaveDetailsActionSuccess({ leave });
      expect(action).toEqual({ leave, type: ActionTypes.LOAD_LEAVE_DETAILS_SUCCESS });
    });
  });

  describe('Add leave actions', () => {
    it('should create addLeaveAction action', () => {
      const payload: LeaveToAdd = {
        start: new Date().toString(),
        isHalfDayStart: true,
        end: new Date().toString(),
        isHalfDayEnd: true,
        leaveType: LeaveType.Holiday,
        description: '',
        state: LeaveState.Pending,
      };
      const action = leavesActions.addLeaveAction({ leave: payload, userId: 1 });
      expect(action).toEqual({ leave: payload, userId: 1, type: ActionTypes.ADD_LEAVE });
    });

    it('should create addLeaveActionSuccess action', () => {
      const action = leavesActions.addLeaveActionSuccess({ leave });
      expect(action).toEqual({ leave, type: ActionTypes.ADD_LEAVE_SUCCESS });
    });
  });

  describe('Update leave actions', () => {
    it('should create updateLeaveAction action', () => {
      const leaveForUpdate: LeaveToUpdate = {
        start: new Date().toString(),
        isHalfDayStart: true,
        end: new Date().toString(),
        isHalfDayEnd: true,
        leaveType: LeaveType.Holiday,
        description: '',
      };

      const action = leavesActions.updateLeaveAction({ leaveUpdated: leaveForUpdate, id: 1 });
      expect(action).toEqual({ leaveUpdated: leaveForUpdate, id: 1, type: ActionTypes.UPDATE_LEAVE });
    });

    it('should create putLeaveStateAction action', () => {
      const leaveToPut: LeaveToPut = { state: LeaveState.Pending, comment: '' };
      const action = leavesActions.putLeaveStateAction({ leaveStatusUpdated: leaveToPut, id: 1 });

      expect(action).toEqual({ leaveStatusUpdated: leaveToPut, id: 1, type: ActionTypes.UPDATE_LEAVE_STATE });
    });

    it('should create updateLeaveActionSuccess action', () => {
      const action = leavesActions.updateLeaveActionSuccess({ leave });
      expect(action).toEqual({ leave, type: ActionTypes.UPDATE_LEAVE_SUCCESS });
    });
  });

  describe('Leave reset state actions', () => {
    it('should create resetLeaveStateAction action', () => {
      const action = leavesActions.ResetLeaveStateAction();
      expect(action.type).toEqual(ActionTypes.RESET_LEAVES_STATE);
    });
  });

  describe('Leave management actions', () => {
    it('should create leaveManagementFailedAction action', () => {
      const action = leavesActions.leaveManagementFailedAction({ withSnackBarNotification: true, errorType: ErrorType.LeaveWithSameDateExists });
      expect(action.type).toEqual(ActionTypes.LEAVE_MANAGEMENT_FAILED);
    });
  });
});
