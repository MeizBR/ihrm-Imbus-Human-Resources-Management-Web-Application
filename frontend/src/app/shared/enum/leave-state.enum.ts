export enum LeaveState {
  Approved = 'Approved',
  Refused = 'Refused',
  Canceled = 'Canceled',
  Pending = 'Pending',
  InProgress = 'InProgress',
}

export namespace LeaveState {
  export type ApiValue = 'Waiting' | 'InProgress' | 'Approved' | 'Refused' | 'Canceled';

  const getAdminValues = (): LeaveState[] => [LeaveState.Pending, LeaveState.InProgress, LeaveState.Approved, LeaveState.Refused, LeaveState.Canceled];
  const getOwnerValues = (): LeaveState[] => [LeaveState.Pending, LeaveState.Canceled];

  export const getAdminStatuses = (stateInUse: LeaveState, isOwner: boolean): LeaveState[] =>
    getAdminValues().filter(state =>
      [LeaveState.Approved, LeaveState.Refused].includes(stateInUse)
        ? state === LeaveState.Pending
        : isOwner
        ? state !== stateInUse
        : ![stateInUse, LeaveState.Canceled].includes(state),
    );

  export const getOwnerStatuses = (stateInUse: LeaveState): LeaveState[] =>
    getOwnerValues().includes(stateInUse) ? getOwnerValues().filter(arr => arr !== stateInUse) : stateInUse === LeaveState.InProgress ? [LeaveState.Canceled] : getOwnerValues();

  export function fromApiValue(value: ApiValue): LeaveState {
    switch (value) {
      case 'Approved':
        return LeaveState.Approved;

      case 'Refused':
        return LeaveState.Refused;

      case 'Canceled':
        return LeaveState.Canceled;

      case 'Waiting':
        return LeaveState.Pending;

      case 'InProgress':
        return LeaveState.InProgress;

      default:
        console.warn(`Can't get from api value, the value '${value}' not supported as a LeaveState !`);

        return LeaveState.Pending;
    }
  }

  export function toApiValue(value: LeaveState): ApiValue {
    switch (value) {
      case LeaveState.Approved:
        return 'Approved';

      case LeaveState.Refused:
        return 'Refused';

      case LeaveState.Canceled:
        return 'Canceled';

      case LeaveState.Pending:
        return 'Waiting';

      case LeaveState.InProgress:
        return 'InProgress';

      default:
        console.warn(`Can't set to api value, the value '${value}' not supported as a LeaveState !`);

        return 'Waiting';
    }
  }

  export function getIconName(value: LeaveState): string {
    switch (value) {
      case LeaveState.Approved:
        return 'done';

      case LeaveState.Refused:
        return 'block';

      case LeaveState.Canceled:
        return 'cancel';

      case LeaveState.Pending:
        return 'hourglass_empty';

      case LeaveState.InProgress:
        return 'rotate_right';

      default:
        console.warn(`Can't get icon name, the value '${value}' not supported as a LeaveState !`);

        return 'hourglass_empty';
    }
  }

  export function getIconColor(value: LeaveState): string {
    switch (value) {
      case LeaveState.Approved:
        return '#008000';

      case LeaveState.Refused:
        return '#ff0000';

      case LeaveState.Canceled:
        return '#f85317';

      case LeaveState.Pending:
        return '#bdbd04';

      case LeaveState.InProgress:
        return '#189bec';

      default:
        console.warn(`Can't get icon color, the value '${value}' not supported as a LeaveState !`);

        return 'hourglass_empty';
    }
  }

  export function getTranslate(value: LeaveState | undefined): string {
    switch (value) {
      case LeaveState.Approved:
        return 'LEAVES_VIEW.STATE.APPROVED';

      case LeaveState.Refused:
        return 'LEAVES_VIEW.STATE.REFUSED';

      case LeaveState.Canceled:
        return 'LEAVES_VIEW.STATE.CANCELED';

      case LeaveState.Pending:
        return 'LEAVES_VIEW.STATE.PENDING';

      case LeaveState.InProgress:
        return 'LEAVES_VIEW.STATE.IN_PROGRESS';

      default:
        console.warn(`Can't translate, the value '${value}' not supported as a LeaveState !`);

        return 'LEAVES_VIEW.STATE.PENDING';
    }
  }
}
