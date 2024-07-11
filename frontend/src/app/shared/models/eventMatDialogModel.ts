import { FormGroup } from '@angular/forms';

import { DateSelectArg, EventClickArg } from '@fullcalendar/angular';

import { CalendarDetails } from './calendar-models/calendar-models-index';

export interface EventMatDialogModel {
  dateSelectArg?: DateSelectArg;
  eventClickArg?: EventClickArg;
  form?: FormGroup;
  calendarList?: CalendarDetails[];
}
