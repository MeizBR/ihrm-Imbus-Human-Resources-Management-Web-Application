import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import * as moment from 'moment';

import { extractLeaveUpdatesFromForm, handleError, initializeLeaveForm, leaveForm } from '../../leaves-helpers';

import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { LeaveDetails, LeaveToPut, LeaveToUpdate, mapToLeaveToPut, mapToUpdatedLeave } from '../../../../shared/models/index';

@Component({
  selector: 'app-edit-leave',
  templateUrl: './edit-leave.component.html',
  styleUrls: ['./edit-leave.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLeaveComponent implements OnChanges {
  @Input() error: ErrorType | undefined;
  @Input() isLeaveLoading: boolean | undefined;
  @Input() isOwner: boolean;
  @Input() isAdministrator: boolean;
  @Input() editLeaveDetails: LeaveDetails;

  @Output() updateLeave = new EventEmitter<{ leave: LeaveToUpdate; leaveId: number }>();
  @Output() updateLeaveStatus = new EventEmitter<{ leave: LeaveToPut; leaveId: number }>();

  public form: FormGroup;
  public ErrorType = ErrorType;
  public LeaveType = LeaveType;
  public LeaveState = LeaveState;
  public isLeaveDataEditable = true;
  public isHalfDayEndHidden: boolean;
  public stateValues: LeaveState[] = [];
  public isLeaveDescriptionEditable = true;

  constructor() {
    this.form = leaveForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    !this.error && !this.isLeaveLoading ? this.onClear() : handleError(this.error, this.form);
    if ((changes['editLeaveDetails'] && this.editLeaveDetails) || changes['isOwner'] || changes['isAdministrator']) {
      this.stateValues = this.isAdministrator ? LeaveState.getAdminStatuses(this.editLeaveDetails.state, this.isOwner) : LeaveState.getOwnerStatuses(this.editLeaveDetails.state);

      this.form.reset();
      initializeLeaveForm({ ...this.editLeaveDetails });
      this.isHalfDayEndHidden = moment(this.editLeaveDetails?.start).isSame(moment(this.editLeaveDetails?.end));
      this.isLeaveDescriptionEditable = this.editLeaveDetails?.editPermission.canEditDescription;
      this.isLeaveDataEditable = this.editLeaveDetails?.editPermission.canEditData;
    }
  }

  public dateChange(): void {
    this.isHalfDayEndHidden = this.isHalfDayHidden();
    this.form.controls['isHalfDayEnd'].setValue(moment(this.form.value.end).isAfter(moment(this.form.value.start)) ? false : this.editLeaveDetails?.isHalfDayEnd);
  }

  public onClear(): void {
    this.form.reset();
    this.form.controls['isHalfDayEnd'].enable();
    this.form.controls['isHalfDayStart'].enable();
    initializeLeaveForm({ ...this.editLeaveDetails });
    this.isHalfDayEndHidden = this.isHalfDayHidden();
  }

  public onSubmit(): void {
    const updatedLeaveDetails: LeaveDetails = extractLeaveUpdatesFromForm();
    const leaveChanges: LeaveToUpdate = mapToUpdatedLeave(updatedLeaveDetails);
    const leaveStatusChanges: LeaveToPut = mapToLeaveToPut(updatedLeaveDetails);

    if (this.form.valid && this.form.dirty) {
      // NOTE: !val was added to not ignore the false value
      // NOTE: since the value of isHalfDayEnd may not be undefined after the map even if it's pristine,
      // the new refact was made to avoid updating the leave when there is no change in the data
      const { isHalfDayEnd, ...restLeaveObject } = leaveChanges;
      if (
        Object.values(restLeaveObject).some(
          val =>
            !!val || (!val && val !== undefined) || (leaveForm.controls['isHalfDayEnd'].dirty && this.editLeaveDetails?.isHalfDayEnd !== leaveForm.controls['isHalfDayEnd'].value),
        )
      ) {
        this.updateLeave.emit({ leave: leaveChanges, leaveId: this.editLeaveDetails?.id });
      }

      // FIXME: this field contains only the comment! the leave state is update by `onUpdateState`
      if (Object.values(leaveStatusChanges).some(val => !!val || val === '')) {
        this.updateLeaveStatus.emit({ leave: leaveStatusChanges, leaveId: this.editLeaveDetails?.id });
      }
    }
  }

  public onUpdateState(state: LeaveState): void {
    this.updateLeaveStatus.emit({
      leave: { state },
      leaveId: this.editLeaveDetails?.id,
    });
  }

  public contentChanged(event, formControlName: string) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls[formControlName].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }

  private isSameStartEndDate = () => moment(this.form.value.start).isSame(moment(this.form.value.end));
  private isHalfDayHidden = () => !((this.form.controls['start'].value && this.form.controls['end'].value) || this.isSameStartEndDate());
}
