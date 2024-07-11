import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { eventForm, initializeEventForm } from '../../event-helpers';

import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { CalendarDetails, EventToAdd } from '../../../../shared/models/index';
import { ErrorType } from '../../../../shared/validators/validation-error-type';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss'],
})
export class AddEventComponent implements OnChanges {
  @Input() error: ErrorType | undefined;
  @Input() isEventsLoading: boolean | undefined;
  @Input() calendarList: CalendarDetails[] | undefined;
  @Output() onSubmitItem = new EventEmitter<EventToAdd>();

  public end: Date;
  public start: Date;
  public checked = true;
  public form: FormGroup;
  public ErrorType = ErrorType;
  public EventType = EventType;
  public formVisibility = false;
  public Repetitive = Repetitive;
  public selectedEventType: string;
  public selectedCalendar: CalendarDetails;

  constructor() {
    this.form = eventForm;
  }

  ngOnChanges(): void {
    if (!this.error && !this.isEventsLoading) {
      this.onClose();
    }
  }

  public createEvent(): void {
    this.formVisibility = true;
  }

  public toggleCheckBox(event): void {
    if (this.checked !== event.checked) {
      this.form.controls['start'].reset();
      this.form.controls['end'].reset();
    }

    this.checked = event.checked;
  }

  public onClose(): void {
    this.form.reset();
    initializeEventForm();
    this.formVisibility = false;
    this.checked = true;
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const eventToAdd: EventToAdd = {
        calendarId: this.form.value.calendarId,
        start: new Date(this.form.controls['start'].value),
        end: new Date(this.form.controls['end'].value),
        title: this.form.value.title,
        description: this.form.value.description,
        repetition: this.form.value.repetition,
        allDay: this.form.value.allDay,
        eventType: this.form.value.eventType,
      };

      this.onSubmitItem.emit(eventToAdd);
      this.onClose();
    }
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }

  public trackCalendarFn = (index, _) => index;
  public trackRepetitions = (index, _) => index;
  public trackEventType = (index, _) => index;
}
