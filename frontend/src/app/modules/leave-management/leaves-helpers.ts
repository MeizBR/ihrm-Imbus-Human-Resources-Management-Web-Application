import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { LeaveDetails } from '../../shared/models/index';
import { dateValidator, ErrorType } from '../../shared/validators/index';

export const displayedLeaveColumns: string[] = ['userName', 'leaveType', 'start', 'end', 'state', 'state-icon', 'actions'];

export const leaveForm: FormGroup = new FormGroup(
  {
    id: new FormControl(null),
    userId: new FormControl(null, [Validators.required]),
    start: new FormControl('', [Validators.required]),
    isHalfDayStart: new FormControl(false),
    end: new FormControl('', [Validators.required]),
    isHalfDayEnd: new FormControl(false),
    leaveType: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    comment: new FormControl(''),
    state: new FormControl(''),
  },
  { validators: dateValidator },
);

export function initializeLeaveForm(leaveFormValues: {}): void {
  leaveForm.patchValue({ ...leaveFormValues });
}

export function clearLeaveForm(): void {
  leaveForm.setValue({
    id: null,
    userId: null,
    start: '',
    isHalfDayStart: false,
    end: '',
    isHalfDayEnd: false,
    leaveType: '',
    description: '',
    comment: '',
    state: '',
  });
  leaveForm.controls['isHalfDayEnd'].enable();
  leaveForm.controls['isHalfDayStart'].enable();
}

function mapIsHalfDayEnd(): boolean | undefined {
  return leaveForm.controls['isHalfDayEnd'].dirty
    ? leaveForm.controls['isHalfDayEnd'].value
    : new Date(leaveForm.controls['start'].value).toDateString() === new Date(leaveForm.controls['end'].value).toDateString()
    ? leaveForm.controls['isHalfDayStart'].value
    : leaveForm.controls['start'].dirty || (leaveForm.controls['end'].dirty && !leaveForm.controls['isHalfDayEnd'].dirty)
    ? false
    : undefined;
}

export function extractLeaveUpdatesFromForm(): LeaveDetails {
  return {
    id: leaveForm.controls['id'].value,
    userId: leaveForm.controls['userId'].value,
    start: leaveForm.controls['start'].dirty ? new Date(leaveForm.controls['start'].value) : undefined,
    isHalfDayStart: leaveForm.controls['isHalfDayStart'].dirty ? leaveForm.controls['isHalfDayStart'].value : undefined,
    end: leaveForm.controls['end'].dirty ? new Date(leaveForm.controls['end'].value) : undefined,
    isHalfDayEnd: mapIsHalfDayEnd(),
    leaveType: leaveForm.controls['leaveType'].dirty ? leaveForm.controls['leaveType'].value : undefined,
    description: leaveForm.controls['description'].dirty ? leaveForm.controls['description'].value ?? '' : undefined,
    state: leaveForm.controls['state'].dirty ? leaveForm.controls['state'].value : undefined,
    comment: leaveForm.controls['comment'].dirty ? leaveForm.controls['comment'].value ?? '' : undefined,
  };
}
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// NOTE: need to implement new function to define the date, and date should be only date not dateTime
export function extractSubLeave(leave: LeaveDetails): LeaveDetails[] {
  const subLeaves =
    leave.isHalfDayEnd && leave.isHalfDayStart
      ? leave.end.toDateString() === leave.start.toDateString()
        ? [{ ...leave, end: leave.start }]
        : leave.end.toDateString() === extractDate(leave.start).toDateString()
        ? [
            { ...leave, end: leave.start }, // INFO: this is refer to the half day
            { ...leave, start: leave.end }, // INFO: this is refer to the half day
          ]
        : [
            { ...leave, end: leave.start, isHalfDayEnd: false }, // INFO: this is refer to the half day
            { ...leave, start: extractDate(leave.start), end: extractDate(leave.end, true), isHalfDayStart: false, isHalfDayEnd: false },
            { ...leave, start: leave.end, isHalfDayStart: false }, // INFO: this is refer to the half day
          ]
      : leave.isHalfDayEnd
      ? leave.end.toDateString() !== leave.start.toDateString()
        ? [
            { ...leave, end: extractDate(leave.end, true), isHalfDayEnd: false }, // INFO:this is refer to the whole date
            { ...leave, start: leave.end }, // INFO: this is refer to the half day
          ]
        : [{ ...leave, start: leave.end }]
      : leave.end.toDateString() !== leave.start.toDateString()
      ? [
          { ...leave, end: leave.start },
          { ...leave, start: extractDate(leave.start), isHalfDayStart: false }, // INFO: this is refer to the whole date
        ]
      : [{ ...leave, end: leave.start }];

  return subLeaves;
}
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// INFO: calculation done to satisfy the end date of fullCalendar plugin.
function extractDate(date: Date, isMinus?: boolean) {
  const coefficient = isMinus ? -1 : 1;

  return new Date(new Date(date).setDate(date.getDate() + coefficient));
}

export function filterPredicate(data: LeaveDetails, filter: string, displayedColumns: string[], datePipe: DatePipe): boolean {
  let res = [];
  const columns = displayedColumns?.filter(col => col !== 'state-icon' && col !== 'actions');
  columns.forEach((col: string) => {
    const filteredData = col === 'start' || col === 'end' ? datePipe.transform(data[col] as Date, 'MMM d, y') : data[col];

    res = [...res, !filter || filteredData?.toString().trim().toLowerCase().includes(filter?.trim().toLowerCase())];
  });

  return res.reduce((sum, next) => sum || next);
}

export function handleError(errorType: ErrorType | undefined, form: FormGroup): void {
  // tslint:disable-next-line:switch-default
  switch (errorType) {
    case ErrorType.LeaveWithSameDateExists:
      form.controls['start'].setErrors({ [ErrorType.LeaveWithSameDateExists]: true });
      form.controls['end'].setErrors({ [ErrorType.LeaveWithSameDateExists]: true });
      break;
  }
}
