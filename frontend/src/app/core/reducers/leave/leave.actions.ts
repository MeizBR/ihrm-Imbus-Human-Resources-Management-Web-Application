import { createAction, props } from '@ngrx/store';

import { ErrorType } from '../../../shared/validators';

import { LeaveDetails, LeaveToAdd, LeaveToPut, LeaveToUpdate } from '../../../shared/models/index';

export enum ActionTypes {
  LOAD_ALL_LEAVES = '[leaveManagement] Loaded Leaves',
  LOAD_ALL_LEAVES_SUCCESS = '[leaveManagement] Loaded Leaves Success',

  LOAD_LEAVE_DETAILS = '[leaveManagement] Loaded Leave Details',
  LOAD_LEAVE_DETAILS_SUCCESS = '[leaveManagement] Loaded Leave Details Success',

  ADD_LEAVE = '[leaveManagement] Added Leave',
  ADD_LEAVE_SUCCESS = '[leaveManagement] Added Leave Success',

  UPDATE_LEAVE = '[leaveManagement] Updated Leave',
  UPDATE_LEAVE_SUCCESS = '[leaveManagement] Updated Leave Success',

  UPDATE_LEAVE_STATE = '[leaveManagement] Updated Leave State',
  UPDATE_LEAVE_STATE_SUCCESS = '[leaveManagement] Updated Leave State Success',

  LEAVE_MANAGEMENT_FAILED = '[leaveManagement] Leave Management Failed',

  RESET_LEAVES_STATE = '[leaveManagement] Reset State',
}

export const leavesActions = {
  loadAllLeavesAction: createAction(ActionTypes.LOAD_ALL_LEAVES),
  loadAllLeavesActionSuccess: createAction(ActionTypes.LOAD_ALL_LEAVES_SUCCESS, props<{ leavesList: LeaveDetails[] }>()),

  loadLeaveDetailsAction: createAction(ActionTypes.LOAD_LEAVE_DETAILS, props<{ leaveId: number }>()),
  loadLeaveDetailsActionSuccess: createAction(ActionTypes.LOAD_LEAVE_DETAILS_SUCCESS, props<{ leave: LeaveDetails }>()),

  addLeaveAction: createAction(ActionTypes.ADD_LEAVE, props<{ leave: LeaveToAdd; userId: number }>()),
  addLeaveActionSuccess: createAction(ActionTypes.ADD_LEAVE_SUCCESS, props<{ leave: LeaveDetails }>()),

  updateLeaveAction: createAction(ActionTypes.UPDATE_LEAVE, props<{ leaveUpdated: LeaveToUpdate; id: number }>()),
  putLeaveStateAction: createAction(ActionTypes.UPDATE_LEAVE_STATE, props<{ leaveStatusUpdated: LeaveToPut; id: number }>()),
  updateLeaveActionSuccess: createAction(ActionTypes.UPDATE_LEAVE_SUCCESS, props<{ leave: LeaveDetails }>()),

  leaveManagementFailedAction: createAction(ActionTypes.LEAVE_MANAGEMENT_FAILED, props<{ withSnackBarNotification: boolean; errorType: ErrorType }>()),

  ResetLeaveStateAction: createAction(ActionTypes.RESET_LEAVES_STATE),
};
