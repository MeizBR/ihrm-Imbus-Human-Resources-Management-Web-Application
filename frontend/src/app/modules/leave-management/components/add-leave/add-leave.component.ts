import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import * as moment from 'moment';

import { clearLeaveForm, handleError, leaveForm } from '../../leaves-helpers';

import { ErrorType } from '../../../../shared/validators/index';
import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveToAdd, UserDetails } from '../../../../shared/models/index';

@Component({
  selector: 'app-add-leave',
  templateUrl: './add-leave.component.html',
  styleUrls: ['./add-leave.component.scss'],
})
export class AddLeaveComponent implements OnChanges {
  @Input() currentUserId: number;
  @Input() userList: UserDetails[];
  @Input() isAdministrator: boolean;
  @Input() error: ErrorType | undefined;
  @Input() isLeaveLoading: boolean | undefined;
  @Output() onAdd = new EventEmitter<{ leave: LeaveToAdd; userId?: number }>();

  public form: FormGroup;
  public ErrorType = ErrorType;
  public LeaveType = LeaveType;
  public formVisibility = false;
  public isHalfDayEndHidden = false;

  constructor() {
    this.form = leaveForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.error && !this.isLeaveLoading) {
      this.onClear();
    } else {
      handleError(this.error, this.form);
    }

    if (changes['isAdministrator'] && !this.isAdministrator) {
      this.form.controls['userId'].disable();
      this.form.patchValue({ ...this.form, userId: this.currentUserId });
    }
  }

  public dateChange(): void {
    this.isHalfDayEndHidden = moment(this.form.value.start).isSame(moment(this.form.value.end)) ? true : false;
  }

  public createLeave(): void {
    this.formVisibility = true;
  }

  public onClear(): void {
    this.form.reset();
    clearLeaveForm();
    if (!this.isAdministrator) {
      this.form.patchValue({ ...this.form, userId: this.currentUserId });
    }
    this.formVisibility = false;
    this.isHalfDayEndHidden = false;
  }

  // INFO: isHalfDayEnd take value same as isHalfDayStart (which is `true`) when it's about half day (we agreed on this)
  public onSubmit(): void {
    if (this.form.valid) {
      const leaveToAdd: LeaveToAdd = {
        start: new Date(this.form.value.start).toLocaleDateString('fr-CA'),
        isHalfDayStart: this.form.value.isHalfDayStart,
        end: new Date(this.form.value.end).toLocaleDateString('fr-CA'),
        isHalfDayEnd: moment(this.form.value.start).isSame(moment(this.form.value.end)) ? this.form.value.isHalfDayStart : this.form.value.isHalfDayEnd,
        leaveType: this.form.value.leaveType,
        description: this.form.value.description,
      };

      this.onAdd.emit({ leave: leaveToAdd, userId: this.isAdministrator ? this.form.value.userId : undefined });
    }
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }
}
