import { PatchCalendar, PostCalendar } from '../../../generated/models';

export interface CalendarToAdd {
  project?: number;
  name: string;
  description: string;
  isPrivate: boolean;
  timeZone: string;
}

export interface CalendarToUpdate {
  // id?: number;
  project?: number;
  name?: string;
  description?: string;
  isPrivate?: boolean;
  timeZone?: string;
}

export function mapCalendarToAddToPostCalendar(data: CalendarToAdd): PostCalendar {
  return {
    name: data.name,
    description: data.description,
    isPrivate: data.isPrivate,
    timeZone: data.timeZone,
  };
}

export function mapCalendarToUpdateToPatchCalendar(data: CalendarToUpdate): PatchCalendar {
  return {
    name: data.name,
    projectId: data.project,
    description: data.description,
    isPrivate: data.isPrivate,
    timeZone: data.timeZone,
  };
}
