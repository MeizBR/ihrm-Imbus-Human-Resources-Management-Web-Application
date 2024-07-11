import { FormControl, FormGroup, Validators } from '@angular/forms';

import { EventType } from '../../shared/enum/event-type.enum';
import { Repetitive } from '../../shared/enum/repetitive.enum';
import { EventDetails } from '../../shared/models/event-models/event-details';
import { dateValidator, trimmedValidator } from '../../shared/validators/custom-validators';

export const displayedEventsColumns: string[] = ['title', 'calendarName', 'eventType', 'isPrivateCalendar', 'start', 'end', 'actions'];

export const eventForm: FormGroup = new FormGroup(
  {
    id: new FormControl(null),
    calendarId: new FormControl(null, Validators.required),
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required),
    title: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
    description: new FormControl(''),
    repetition: new FormControl(Repetitive.Unrepeatable),
    allDay: new FormControl(true, Validators.required),
    eventType: new FormControl(EventType.Meeting, Validators.required),
  },
  { validators: dateValidator },
);

export function initializeEventForm(): void {
  eventForm.setValue({
    id: null,
    calendarId: null,
    start: '',
    end: '',
    title: '',
    description: '',
    repetition: Repetitive.Unrepeatable,
    allDay: true,
    eventType: EventType.Meeting,
  });
}

export function sortingDataAccessor(data: EventDetails, sortHeaderId: string): string {
  return typeof data[sortHeaderId] === 'string' ? data[sortHeaderId]?.toLowerCase() : data[sortHeaderId];
}

export function filterPredicate(data: EventDetails, filter: string, displayedColumns: string[]): boolean {
  let res = [];
  const columns = displayedColumns?.filter(col => col !== 'actions');
  columns.forEach((col: string) => {
    res = [...res, !filter || data[col]?.toString().trim().toLowerCase().includes(filter?.trim().toLowerCase())];
  });

  return res.reduce((sum, next) => sum || next);
}

export function extractEventUpdatesFromForm(): EventDetails {
  return {
    id: eventForm.controls['id'].value,
    calendarId: eventForm.controls['calendarId'].dirty ? eventForm.controls['calendarId'].value : undefined,
    start: eventForm.controls['start'].dirty ? new Date(eventForm.controls['start'].value) : undefined,
    end: eventForm.controls['end'].dirty ? new Date(eventForm.controls['end'].value) : undefined,
    title: eventForm.controls['title'].dirty ? eventForm.controls['title'].value : undefined,
    description: eventForm.controls['description'].dirty ? eventForm.controls['description'].value ?? '' : undefined,
    repetition: eventForm.controls['repetition'].dirty ? eventForm.controls['repetition'].value : undefined,
    allDay: eventForm.controls['allDay'].dirty ? eventForm.controls['allDay'].value : undefined,
    eventType: eventForm.controls['eventType'].dirty ? eventForm.controls['eventType'].value : undefined,
  };
}
