import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

import { calendarForm, extractCalendarUpdatesFromForm } from '../../calendar-helpers';

import { TIMEZONES } from '../../../../shared/models/timeZone';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CalendarDetails, CalendarToUpdate, ProjectDetails } from '../../../../shared/models/index';

@Component({
  selector: 'app-edit-calendar',
  templateUrl: './edit-calendar.component.html',
  styleUrls: ['./edit-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCalendarComponent implements OnChanges, OnDestroy {
  @Input() isOwner: boolean;
  @Input() error: ErrorType | undefined;
  @Input() projectsList: ProjectDetails[];
  @Input() editCalendarDetails: CalendarDetails;
  @Output() onDeleteCalendar = new EventEmitter<number>();
  @Output() updateCalendar = new EventEmitter<{ calendarId: number; calendarForUpdate: CalendarToUpdate }>();

  public form: FormGroup;
  public ErrorType = ErrorType;
  public TIMEZONES = TIMEZONES;
  public canUpdateVisibility: boolean;
  public selectedProject: ProjectDetails;

  constructor() {
    this.form = calendarForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOwner'] && this.isOwner) {
      !this.isOwner ? this.form?.controls['isPrivate']?.disable() : this.form?.controls['isPrivate']?.enable();
    }

    if (changes['projectsList'] && this.projectsList) {
      !this.projectsList.length ? this.form?.controls['projectId']?.disable() : this.form?.controls['projectId']?.enable();
    }

    if (changes['editCalendarDetails'] && this.editCalendarDetails) {
      this.selectedProject = this.projectsList?.find(cal => cal?.id === this.editCalendarDetails?.project);

      this.form?.reset();
      this.form?.patchValue({
        id: this.editCalendarDetails?.id,
        projectId: this.editCalendarDetails?.project,
        name: this.editCalendarDetails?.name,
        description: this.editCalendarDetails?.description,
        isPublic: !this.editCalendarDetails?.isPrivate,
        timeZone: this.editCalendarDetails?.timeZone,
      });
      this.canUpdateVisibility = this.editCalendarDetails?.isPrivate || this.editCalendarDetails?.userPermission?.canUpdateVisibility;
    }

    if (changes['error'] && this.error) {
      this.handleError(this.error);
    }
  }

  ngOnDestroy(): void {
    this.form.setValue({ id: '', projectId: '', name: '', description: '', isPublic: '', timeZone: '' });
  }

  public onProjectChange(id: number) {
    this.selectedProject = this.projectsList?.find(project => project?.id === id);
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const updatedCalendar: CalendarToUpdate = extractCalendarUpdatesFromForm();
      this.updateCalendar.emit({ calendarId: this.editCalendarDetails?.id, calendarForUpdate: updatedCalendar });
    }
  }

  public onCancelEdit(): void {
    this.selectedProject = this.projectsList?.find(cal => cal?.id === this.editCalendarDetails?.project);
    this.form.reset();
    this.form.setValue({
      id: this.editCalendarDetails?.id,
      projectId: this.editCalendarDetails?.project,
      name: this.editCalendarDetails?.name,
      description: this.editCalendarDetails?.description,
      isPublic: !this.editCalendarDetails?.isPrivate,
      timeZone: this.editCalendarDetails?.timeZone,
    });
  }

  public deleteCalendar() {
    this.onDeleteCalendar.emit(this.editCalendarDetails.id);
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }

  public projectTrackFn = (i: number, _: ProjectDetails) => i;

  public timezoneTrackFn = (i: number, _: string) => i;

  private handleError(errorType: ErrorType | undefined): void {
    if (errorType === ErrorType.NameAlreadyExists) {
      this.form.controls['name'].setErrors({ [ErrorType.NameAlreadyExists]: true });
    }
  }
}
