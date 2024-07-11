import { PatchEvent, PostEvent } from '../../../generated/models';

import { EventDetails } from '..';
import { EventType } from '../../enum/event-type.enum';
import { Repetitive } from '../../enum/repetitive.enum';

export interface EventToAdd {
  calendarId: number;
  start: Date;
  end: Date;
  title: string;
  description?: string;
  repetition?: Repetitive;
  allDay: boolean;
  eventType: EventType;
}

export interface EventToUpdate {
  id?: number;
  calendarId?: number;
  isPrivateCalendar?: boolean;
  start?: Date;
  end?: Date;
  title?: string;
  description?: string;
  repetition?: Repetitive;
  allDay?: boolean;
  eventType?: EventType;
}

export function mapEventDetailsToUpdatedLeave(event: EventDetails): EventToUpdate {
  return {
    id: event.id,
    calendarId: event.calendarId,
    isPrivateCalendar: event.isPrivateCalendar,
    start: event.start,
    end: event.end,
    title: event.title,
    description: event.description,
    repetition: event.repetition,
    allDay: event.allDay,
    eventType: event.eventType,
  };
}

export function mapEventToAddToPostEvent(data: EventToAdd): PostEvent {
  return {
    calendarId: data.calendarId,
    start: data.start ? data.start.toISOString() : undefined,
    end: data.end ? data.end.toISOString() : undefined,
    title: data.title,
    description: data.description,
    repetition: data.repetition,
    allDay: data.allDay,
    eventType: data.eventType,
  };
}

export function mapEventToUpdateToPatchEvent(data: EventToUpdate): PatchEvent {
  return {
    calendarId: data.calendarId,
    start: data.start ? data.start.toISOString() : undefined,
    end: data.end ? data.end.toISOString() : undefined,
    title: data.title,
    description: data.description,
    repetition: data.repetition,
    allDay: data.allDay,
    eventType: data.eventType,
  };
}
