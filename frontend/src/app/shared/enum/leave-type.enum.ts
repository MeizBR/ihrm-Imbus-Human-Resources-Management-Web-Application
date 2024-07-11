export enum LeaveType {
  Sick = 'Sick',
  Holiday = 'Holiday',
}

export namespace LeaveType {
  export type ApiValue = 'Sick' | 'Holiday';

  export function getValues(): LeaveType[] {
    return [LeaveType.Sick, LeaveType.Holiday];
  }

  export function fromApiValue(value: ApiValue): LeaveType {
    switch (value) {
      case 'Sick':
        return LeaveType.Sick;

      case 'Holiday':
        return LeaveType.Holiday;

      default:
        console.warn(`Can't get from api value, the value '${value}' not supported as a LeaveType !`);

        return LeaveType.Sick;
    }
  }

  export function toApiValue(value: LeaveType): string {
    switch (value) {
      case LeaveType.Sick:
        return 'Sick';

      case LeaveType.Holiday:
        return 'Holiday';

      default:
        console.warn(`Can't set to api value, the value '${value}' not supported as a LeaveType !`);

        return 'Sick';
    }
  }

  export function getTranslate(value: LeaveType | undefined): string {
    switch (value) {
      case LeaveType.Sick:
        return 'LEAVES_VIEW.LEAVE_TYPE.LEAVE_TYPE_ENUM.SICK';

      case LeaveType.Holiday:
        return 'LEAVES_VIEW.LEAVE_TYPE.LEAVE_TYPE_ENUM.HOLIDAY';

      default:
        console.warn(`Can't translate, the value '${value}' not supported as a LeaveType !`);

        return 'LEAVES_VIEW.LEAVE_TYPE.LEAVE_TYPE_ENUM.SICK';
    }
  }
}
