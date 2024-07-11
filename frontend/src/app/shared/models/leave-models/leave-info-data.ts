import { PutLeave } from '../../../generated/putLeave';
import { PostLeave } from '../../../generated/postLeave';
import { PatchLeave } from '../../../generated/patchLeave';

import { LeaveType } from '../../enum/leave-type.enum';
import { LeaveState } from '../../enum/leave-state.enum';

export interface LeaveToAdd {
  start: string;
  isHalfDayStart: boolean;
  end: string;
  isHalfDayEnd: boolean;
  leaveType: LeaveType;
  description: string;
  state?: LeaveState;
}

export interface LeaveUpdated {
  id: number;
  start?: Date;
  isHalfDayStart?: boolean;
  end?: Date;
  isHalfDayEnd?: boolean;
  userId?: number;
  leaveType?: LeaveType;
  description?: string;
  state?: LeaveState;
  comment?: string;
}

export interface LeaveToUpdate {
  start?: string;
  isHalfDayStart?: boolean;
  end?: string;
  isHalfDayEnd?: boolean;
  leaveType?: LeaveType;
  description?: string;
}

export interface LeaveToPut {
  state?: LeaveState;
  comment?: string;
}

export interface UpdatedLeave {
  leaveToUpdate: LeaveToUpdate;
  leaveToPut: LeaveToPut;
}

export function mapToLeaveToPut(leave: LeaveUpdated): LeaveToPut {
  return {
    state: leave.state,
    comment: leave.comment,
  };
}

export function mapToUpdatedLeave(leave: LeaveUpdated): LeaveToUpdate {
  return {
    start: leave.start?.toLocaleDateString('fr-CA'),
    isHalfDayStart: leave.isHalfDayStart,
    end: leave.end?.toLocaleDateString('fr-CA'),
    isHalfDayEnd: leave.isHalfDayEnd,
    leaveType: leave.leaveType,
    description: leave.description,
  };
}

export function mapLeaveToAddToPostLeave(data: LeaveToAdd): PostLeave {
  return {
    start: data.start,
    isFullDayStart: data.isHalfDayStart !== undefined ? !data.isHalfDayStart : !data.isHalfDayEnd,
    end: data.end,
    isFullDayEnd: data.isHalfDayEnd !== undefined ? !data.isHalfDayEnd : !data.isHalfDayStart,
    daysNumber: (new Date(data.end).getTime() - new Date(data.start).getTime()) / (3600000 * 24) + 1,
    leaveType: data.leaveType,
    description: data.description,
  };
}

export function mapLeaveToUpdateToPatchLeave(data: LeaveToUpdate): PatchLeave {
  return {
    start: data.start,
    isFullDayStart: data.isHalfDayStart !== undefined ? !data.isHalfDayStart : data.isHalfDayStart,
    end: data.end,
    isFullDayEnd: data.isHalfDayEnd !== undefined ? !data.isHalfDayEnd : data.isHalfDayEnd,
    leaveType: data.leaveType,
    description: data.description,
  };
}

export function mapLeaveToPutToPutLeave(data: LeaveToPut): PutLeave {
  return {
    state: data?.state ? LeaveState.toApiValue(data.state) : undefined,
    comment: data.comment,
  };
}
