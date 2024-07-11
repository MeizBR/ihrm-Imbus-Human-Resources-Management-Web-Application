import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { eventForm, extractEventUpdatesFromForm } from '../../event-helpers';

import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CalendarDetails, EventDetails, EventToUpdate, mapEventDetailsToUpdatedLeave } from '../../../../shared/models/index';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEventComponent implements OnChanges {
  @Input() editEventDetails: EventDetails;
  @Input() calendarsList: CalendarDetails[];
  @Output() onDeleteEvent = new EventEmitter<number>();
  @Output() updateEvent = new EventEmitter<{ eventToUpdate: EventToUpdate; calendarUpdated: boolean }>();

  public checked: boolean;
  public form: FormGroup;
  public ErrorType = ErrorType;
  public EventType = EventType;
  public Repetitive = Repetitive;
  public selectedCalendar: CalendarDetails;

  constructor() {
    this.form = eventForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['editEventDetails'] && this.editEventDetails) || (changes['calendarsList'] && this.calendarsList)) {
      this.checked = this.editEventDetails?.allDay;
      this.selectedCalendar = this.calendarsList?.find(cal => cal?.id === this.editEventDetails?.calendarId);
      this.form.reset();
      this.form.patchValue({
        id: this.editEventDetails?.id,
        calendarId: this.editEventDetails?.calendarId,
        start: this.editEventDetails?.start,
        end: this.editEventDetails?.end,
        title: this.editEventDetails?.title,
        description: this.editEventDetails?.description,
        repetition: this.editEventDetails?.repetition,
        allDay: this.editEventDetails?.allDay,
        eventType: this.editEventDetails?.eventType,
      });
    }
  }

  public onCancelEdit(): void {
    this.selectedCalendar = this.calendarsList?.find(cal => cal?.id === this.editEventDetails?.calendarId);
    this.form.reset();
    this.form.patchValue({
      id: this.editEventDetails?.id,
      calendarId: this.editEventDetails?.calendarId,
      start: this.editEventDetails?.start,
      end: this.editEventDetails?.end,
      title: this.editEventDetails?.title,
      description: this.editEventDetails?.description,
      repetition: this.editEventDetails?.repetition,
      allDay: this.editEventDetails?.allDay,
      eventType: this.editEventDetails?.eventType,
    });
    this.checked = this.editEventDetails?.allDay;
  }

  public onCalendarChange(id: number) {
    this.selectedCalendar = this.calendarsList?.find(cal => cal?.id === id);
  }

  public toggleAllDaySlide(checked: boolean): void {
    if (this.checked !== checked) {
      this.form.controls['start'].reset();
      this.form.controls['end'].reset();
    }
    this.checked = checked;
  }

  public onSubmit(): void {
    if (this.form.valid && this.form.dirty) {
      const eventChanges: EventToUpdate = mapEventDetailsToUpdatedLeave(extractEventUpdatesFromForm());
      this.updateEvent.emit({
        eventToUpdate: { ...eventChanges, isPrivateCalendar: this.selectedCalendar.isPrivate },
        calendarUpdated: !!eventChanges.calendarId && this.selectedCalendar.isPrivate,
      });
    }
  }

  public deleteEvent(): void {
    this.onDeleteEvent.emit(this.editEventDetails.id);
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }

  public trackCalendarFn = (index, _) => index;
  public trackRepetitions = (index: number, _: Repetitive) => index;
  public trackEventType = (index: number, _: EventType) => index;
}
