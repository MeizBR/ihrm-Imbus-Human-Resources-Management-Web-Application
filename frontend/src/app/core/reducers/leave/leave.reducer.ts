import { Action, createReducer, on } from '@ngrx/store';

import { LeaveDetails } from './../../../shared/models/index';

import { leavesActions } from '../leave/leave.actions';

import { ErrorType } from '../../../shared/validators/validation-error-type';

export const leavesReducerKey = 'leavesReducer';

export interface LeavesState {
  leavesList: LeaveDetails[] | undefined;
  selectedLeave: LeaveDetails | undefined;
  error: ErrorType | undefined;
  loadingAction: boolean | undefined;
}

export const initialLeavesState: LeavesState = {
  leavesList: undefined,
  selectedLeave: undefined,
  error: undefined,
  loadingAction: undefined,
};

const leavesReducer = createReducer(
  initialLeavesState,
  on(leavesActions.loadAllLeavesAction, (state, _): LeavesState => ({ ...state, error: undefined, loadingAction: true })),
  on(leavesActions.loadAllLeavesActionSuccess, (state, payload): LeavesState => ({ ...state, leavesList: payload.leavesList, error: undefined, loadingAction: false })),
  on(leavesActions.loadLeaveDetailsAction, (state, _): LeavesState => ({ ...state, error: undefined, loadingAction: true })),
  on(leavesActions.loadLeaveDetailsActionSuccess, (state, payload): LeavesState => ({ ...state, selectedLeave: payload.leave, error: undefined, loadingAction: false })),
  on(leavesActions.addLeaveAction, (state, _): LeavesState => ({ ...state, error: undefined, loadingAction: true })),
  on(
    leavesActions.addLeaveActionSuccess,
    (state, payload): LeavesState => ({
      ...state,
      leavesList: [...state.leavesList, payload.leave],
      error: undefined,
      loadingAction: false,
    }),
  ),
  on(leavesActions.updateLeaveAction, (state, _): LeavesState => ({ ...state, error: undefined, loadingAction: true })),
  on(
    leavesActions.updateLeaveActionSuccess,
    (state, payload): LeavesState => ({
      ...state,
      leavesList: [...state.leavesList.map(l => (l.id === payload.leave.id ? payload.leave : l))],
      selectedLeave: payload.leave,
      error: undefined,
      loadingAction: false,
    }),
  ),
  on(leavesActions.leaveManagementFailedAction, (state, payload): LeavesState => ({ ...state, error: payload.errorType, loadingAction: false })),
  on(leavesActions.ResetLeaveStateAction, (): LeavesState => ({ ...initialLeavesState })),
);

export function reducer(state: LeavesState | undefined, action: Action): LeavesState {
  return leavesReducer(state, action);
}
