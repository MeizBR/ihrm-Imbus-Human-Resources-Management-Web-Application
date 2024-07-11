import { CalendarDetails } from './calendar-models/calendar-models-index';

export interface EventInputDetails {
  id: string;
  calendar: CalendarDetails;
  title: string;
  eventType: string;
  start: Date | string;
  end: Date | string;
  allDay: boolean;
  leaveType: string;
  user: string; // @Hejer: to be defined as instance of User interface
  description: string;
  repetitive: string;
  startStr?: string;
  endStr?: string;
  className?: string;
}
