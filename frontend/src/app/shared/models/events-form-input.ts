import { CalendarDetails } from './calendar-models/calendar-models-index';

export interface EventsFormInput {
  id: number;
  calendar: CalendarDetails;
  start: string;
  end: string;
  title: string;
  eventType: string;
  leaveType: string;
  user: string; // @Hejer: to be defined as instance of User interface
  allDay: boolean;
  description: string;
  repetitive: string;
}
