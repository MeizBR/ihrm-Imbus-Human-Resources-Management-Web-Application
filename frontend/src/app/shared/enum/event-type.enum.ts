export enum EventType {
  Meeting = 'Meeting',
  Workshop = 'Workshop',
  Training = 'Training',
  Leave = 'Leave',
}

export namespace EventType {
  export type ApiValue = 'Meeting' | 'Workshop' | 'Training' | 'Leave';

  export function getValues(): EventType[] {
    return [EventType.Meeting, EventType.Workshop, EventType.Training, EventType.Leave];
  }

  export function fromApiValue(value: ApiValue): EventType {
    switch (value) {
      case 'Meeting':
        return EventType.Meeting;

      case 'Workshop':
        return EventType.Workshop;

      case 'Training':
        return EventType.Training;
      case 'Leave':
        return EventType.Leave;

      default:
        break;
    }
  }

  export function toApiValue(value: EventType): string | undefined {
    switch (value) {
      case EventType.Meeting:
        return 'Meeting';

      case EventType.Workshop:
        return 'Workshop';

      case EventType.Training:
        return 'Training';

      case EventType.Leave:
        return 'Leave';

      default:
        return undefined;
    }
  }

  export function getEventColor(value: EventType): string {
    switch (value) {
      case EventType.Meeting:
        return /* '#729b8e' */ '#2b67a1';

      case EventType.Workshop:
        return '#7289da';

      case EventType.Training:
        return '#386068';

      case EventType.Leave:
        return '#f44336';

      default:
        break;
    }
  }

  export function getTranslate(value: EventType | undefined): string {
    switch (value) {
      case EventType.Meeting:
        return 'EVENTS_VIEW.EVENT_TYPE_ENUM.MEETING';

      case EventType.Workshop:
        return 'EVENTS_VIEW.EVENT_TYPE_ENUM.WORKSHOP';

      case EventType.Training:
        return 'EVENTS_VIEW.EVENT_TYPE_ENUM.TRAINING';

      case EventType.Leave:
        return 'EVENTS_VIEW.EVENT_TYPE_ENUM.LEAVE';

      default:
        break;
    }
  }
}
