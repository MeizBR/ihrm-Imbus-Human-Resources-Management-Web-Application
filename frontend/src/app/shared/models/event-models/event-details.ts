import { EventInput } from '@fullcalendar/angular';
import { Event } from '../../../generated/event';

import { EventType } from '../../enum/event-type.enum';
import { Repetitive } from '../../../shared/enum/repetitive.enum';

export interface EventDetails {
  id: number;
  calendarId: number;
  calendarName?: string;
  isPrivateCalendar?: boolean;
  start: Date;
  end: Date;
  title: string;
  description: string;
  repetition: Repetitive;
  allDay: boolean;
  eventType: EventType;
  creator?: number;
  userPermission?: EventUserPermission;
}

export interface EventUserPermission {
  canDelete?: boolean;
}

export function mapEventToEventDetails(data: Event): EventDetails {
  return {
    id: data.id,
    calendarId: data.calendarId,
    isPrivateCalendar: data.isPrivateCalendar,
    start: new Date(data.start),
    end: new Date(data.end),
    title: data.title,
    description: data.description,
    repetition: Repetitive.fromApiValue(data.repetition as Repetitive.ApiValue),
    allDay: data.allDay,
    eventType: EventType.fromApiValue(data.eventType as EventType.ApiValue),
    creator: data.creator,
  };
}

export function mapEventToEventInput(data: EventDetails): EventInput {
  return {
    id: data.id.toString(),
    isClickable: true,
    calendarId: data.calendarId,
    start: new Date(data.start),
    end: data.allDay ? new Date(new Date(data.end).setDate(data.end.getDate() + 1)) : new Date(data.end),
    title: data.title,
    allDay: data.allDay,
    backgroundColor: EventType.getEventColor(data.eventType),
    borderColor: EventType.getEventColor(data.eventType),
    className: `event-${data.id}-cal-${data.calendarId}`,
  };
}
