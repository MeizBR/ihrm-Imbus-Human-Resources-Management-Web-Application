import { flatten } from 'lodash';
import { createSelector } from '@ngrx/store';

import { AppState } from '..';
import { selectUserSession } from '../auth';
import { mappedUsersList } from '../user/index';
import * as leavesReducer from '../leave/leave.reducer';

import { extractSubLeave } from '../../../modules/leave-management/leaves-helpers';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { LeaveState } from '../../../shared/enum/leave-state.enum';
import { EditLeavePermissions } from '../../../shared/enum/actions.enum';
import { isActionEditPermitted, LeaveDetails } from '../../../shared/models/index';

export const selectFeature = (state: AppState) => state[leavesReducer.leavesReducerKey];
export const getLeavesList = createSelector(selectFeature, state => state.leavesList);
export const getSelectedLeave = createSelector(selectFeature, state => state.selectedLeave);
export const getLeavesError = createSelector(selectFeature, state => state.error);
export const getLeavesLoading = createSelector(selectFeature, state => state.loadingAction);

export const getLeavesDetailsList = createSelector(getLeavesList, mappedUsersList, selectUserSession, (leaves, users, userSession): LeaveDetails[] =>
  leaves?.map(leave => ({
    ...leave,
    userName: users?.find(user => user.id === leave.userId)?.fullName,
    isActiveUser: users?.find(user => user.id === leave.userId)?.isActive,
    editPermission: {
      canEdit: userSession?.globalRoles?.includes(RoleModel.Administrator) || leave?.userId === userSession?.userId,
    },
  })),
);

export const getFilteredLeavesList = createSelector(getLeavesDetailsList, mappedUsersList, (leaves, users) => {
  return flatten(
    leaves
      // tslint:disable-next-line: max-line-length
      ?.filter(leave => users?.find(user => user.id === leave.userId)) // FIXME: To be deleted after the backend fix (Get leaves should return leaves of existing users not the deleted one)
      ?.filter(leave => [LeaveState.Pending, LeaveState.InProgress, LeaveState.Approved].includes(leave.state))
      .map(leave => (!leave.isHalfDayStart && !leave.isHalfDayEnd ? leave : extractSubLeave(leave))),
  );
});

export const getUserLeavesDetailsList = createSelector(getLeavesDetailsList, selectUserSession, (leaves, userSession): LeaveDetails[] =>
  userSession?.globalRoles.includes(RoleModel.Administrator) ? leaves : leaves?.filter(l => l.userId === userSession?.userId),
);

const getSelectedLeaveData = createSelector(
  getSelectedLeave,
  mappedUsersList,
  (l, u): LeaveDetails => ({
    ...l,
    userName: u?.find(user => user.id === l?.userId)?.fullName,
    isActiveUser: u?.find(user => user.id === l?.userId)?.isActive,
  }),
);

export const getSelectedLeaveDetails = createSelector(
  getSelectedLeaveData,
  selectUserSession,
  (leave, us): LeaveDetails => {
    return {
      ...leave,
      editPermission: {
        canEdit: us?.globalRoles?.includes(RoleModel.Administrator) || leave?.userId === us?.userId,
        canEditData: isActionEditPermitted(EditLeavePermissions.EditCalendar, us?.globalRoles?.includes(RoleModel.Administrator), leave?.state),
        canEditStatus: isActionEditPermitted(EditLeavePermissions.EditStatus, us?.globalRoles?.includes(RoleModel.Administrator), leave?.state),
        canEditDescription: isActionEditPermitted(EditLeavePermissions.EditDescription, us?.globalRoles?.includes(RoleModel.Administrator), leave?.state),
      },
    };
  },
);
