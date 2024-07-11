import { EventInput } from '@fullcalendar/angular';

import { Leave } from '../../../generated/leave';
import { LeaveType } from '../../enum/leave-type.enum';
import { LeaveState } from '../../enum/leave-state.enum';
import { EditLeavePermissions } from '../../../shared/enum/actions.enum';

export interface LeaveDetails {
  id: number;
  start: Date;
  isHalfDayStart: boolean;
  end: Date;
  isHalfDayEnd: boolean;
  userId: number;
  leaveType: LeaveType;
  description: string;
  state?: LeaveState;
  comment: string;
  userName?: string;
  isActiveUser?: boolean;
  editPermission?: EditPermissions;
}

interface EditPermissions {
  canEdit: boolean;
  canEditData?: boolean;
  canEditStatus?: boolean;
  canEditDescription?: boolean;
}

export function mapLeaveToLeaveDetails(data: Leave): LeaveDetails {
  return {
    id: data.id,
    start: new Date(new Date(data.start).toDateString()),
    isHalfDayStart: !data.isFullDayStart,
    end: new Date(new Date(data.end).toDateString()),
    isHalfDayEnd: !data.isFullDayEnd,
    userId: data.userId,
    leaveType: LeaveType.fromApiValue(data.leaveType as LeaveType.ApiValue),
    description: data.description,
    state: LeaveState.fromApiValue(data.state),
    comment: data.comment,
  };
}

export function mapLeaveToEventInput(data: LeaveDetails): EventInput {
  const nonClickableClass = data?.editPermission.canEdit ? '' : 'not-clickable';

  return {
    id: data?.id.toString(),
    isClickable: data?.editPermission.canEdit,
    start: new Date(data?.start),
    end: !data?.isHalfDayStart && !data?.isHalfDayEnd ? new Date(new Date(data?.end).setDate(data?.end.getDate() + 1)) : new Date(data?.end),
    title: data?.userName?.concat(' : ', data?.leaveType),
    allDay: !data?.isHalfDayStart && !data?.isHalfDayEnd,
    backgroundColor: data?.leaveType === LeaveType.Holiday ? '#00A300' : '#ff7f00',
    borderColor: data?.leaveType === LeaveType.Holiday ? '#00A300' : '#ff7f00',
    className: `leave-${data?.id} ${nonClickableClass}`,
  };
}

const editLeaveAction = [
  /** Admin actions permissions */
  { action: EditLeavePermissions.EditStatus, isAdmin: true, requiredStatus: [LeaveState.Pending, LeaveState.InProgress, LeaveState.Approved, LeaveState.Refused] },
  { action: EditLeavePermissions.EditDescription, isAdmin: true, requiredStatus: [LeaveState.Pending, LeaveState.InProgress] },
  { action: EditLeavePermissions.EditComment, isAdmin: true, requiredStatus: [LeaveState.Pending, LeaveState.InProgress] },
  { action: EditLeavePermissions.EditCalendar, isAdmin: true, requiredStatus: [LeaveState.Pending] },
  { action: EditLeavePermissions.EditType, isAdmin: true, requiredStatus: [LeaveState.Pending] },
  { action: EditLeavePermissions.EditDate, isAdmin: true, requiredStatus: [LeaveState.Pending] },

  /** Owner actions permissions */
  { action: EditLeavePermissions.EditStatus, isAdmin: false, requiredStatus: [LeaveState.Pending, LeaveState.InProgress] },
  { action: EditLeavePermissions.EditDescription, isAdmin: false, requiredStatus: [LeaveState.Pending, LeaveState.InProgress] },
  { action: EditLeavePermissions.EditCalendar, isAdmin: false, requiredStatus: [LeaveState.Pending] },
  { action: EditLeavePermissions.EditType, isAdmin: false, requiredStatus: [LeaveState.Pending] },
  { action: EditLeavePermissions.EditDate, isAdmin: false, requiredStatus: [LeaveState.Pending] },
];

export const isActionEditPermitted = function (action: EditLeavePermissions, isAdmin: boolean, status: LeaveState): boolean {
  return !!editLeaveAction?.find(act => act.action === action && act.isAdmin === isAdmin)?.requiredStatus.includes(status);
};
