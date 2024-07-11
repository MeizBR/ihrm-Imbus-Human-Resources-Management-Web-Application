import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { calendarForm } from '../../calendar-helpers';
import { TIMEZONES } from '../../../../shared/models/timeZone';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CalendarToAdd, ProjectDetails } from '../../../../shared/models/index';

@Component({
  selector: 'app-add-calendar',
  templateUrl: './add-calendar.component.html',
  styleUrls: ['./add-calendar.component.scss'],
})
export class AddCalendarComponent implements OnChanges {
  @Input() error: ErrorType | undefined;
  @Input() isCalendarsLoading: boolean | undefined;
  @Input() projectsList: ProjectDetails[] | undefined;
  @Output() onAdd = new EventEmitter<CalendarToAdd>();

  public TIMEZONES = TIMEZONES;
  public ErrorType = ErrorType;
  public formVisibility = false;
  public addCalendarForm: FormGroup;

  constructor() {
    this.addCalendarForm = calendarForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectsList'] && this.projectsList) {
      // NOTE: It's recommended to disable the control directly to avoid warning in test
      !this.projectsList?.length ? this.addCalendarForm.controls['projectId'].disable() : this.addCalendarForm.controls['projectId'].enable();
    }
    if (!this.error && !this.isCalendarsLoading) {
      this.close();
    } else {
      this.handleError(this.error);
    }
  }

  public onSubmit(): void {
    if (this.addCalendarForm.valid) {
      this.onAdd.emit({
        project: this.addCalendarForm.controls['projectId'].value,
        name: this.addCalendarForm.controls['name'].value,
        description: this.addCalendarForm.controls['description'].value,
        isPrivate: !this.addCalendarForm.controls['isPublic'].value,
        timeZone: this.addCalendarForm.controls['timeZone'].value,
      });
    }
  }

  public close(): void {
    this.formVisibility = false;
    this.resetAddCalendarForm();
  }

  private resetAddCalendarForm(): void {
    this.addCalendarForm?.reset();
    this.addCalendarForm?.setValue({ id: '', projectId: '', name: '', description: '', isPublic: false, timeZone: '' });
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.addCalendarForm.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }

  private handleError(errorType: ErrorType | undefined): void {
    if (errorType === ErrorType.NameAlreadyExists) {
      this.addCalendarForm.controls['name'].setErrors({ [ErrorType.NameAlreadyExists]: true });
    }
  }
}
