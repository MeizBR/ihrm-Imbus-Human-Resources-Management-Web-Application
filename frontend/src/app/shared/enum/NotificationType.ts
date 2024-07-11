export enum NotificationType {
  Leave = 'Leave',
  Activity = 'Activity',
  Project = 'Project',
}

export namespace NotificationsType {
  export type NotificationTypeEnum = 'Leave' | 'Activity' | 'Project';

  export function getValues(): NotificationTypeEnum[] {
    return [NotificationType.Leave, NotificationType.Activity, NotificationType.Project];
  }

  export function fromApiValue(value: NotificationTypeEnum): NotificationType {
    switch (value) {
      case 'Leave':
        return NotificationType.Leave;

      case 'Activity':
        return NotificationType.Activity;

      case 'Project':
        return NotificationType.Project;

      default:
        console.warn(`Can't get from api value, the value '${value}' not supported as a NotificationType !`);

        return NotificationType.Leave;
    }
  }

  export function toApiValue(value: NotificationType): NotificationTypeEnum {
    switch (value) {
      case NotificationType.Leave:
        return 'Leave';

      case NotificationType.Activity:
        return 'Activity';

      case NotificationType.Project:
        return 'Project';

      default:
        console.warn(`Can't set to api value, the value '${value}' not supported as a NotificationType !`);

        return 'Leave';
    }
  } }
