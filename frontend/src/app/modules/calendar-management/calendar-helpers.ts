import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { trimmedValidator } from '../../shared/validators/custom-validators';
import { CalendarDetails, CalendarFormInput, CalendarToUpdate } from '../../shared/models/index';

/** Calendar tools */
export const displayedCalendarsColumns: string[] = ['name', 'project', 'timeZone', 'isPublic', 'actions'];

type CalendarInputControls = { [key in keyof CalendarFormInput]: AbstractControl };
type CalendarInputFormGroup = FormGroup & {
  value: CalendarFormInput;
  controls: CalendarInputControls;
};
export const calendarForm: FormGroup = new FormGroup({
  id: new FormControl(null),
  projectId: new FormControl(null),
  name: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
  description: new FormControl(''),
  isPublic: new FormControl(''),
  timeZone: new FormControl(''),
} as CalendarInputControls) as CalendarInputFormGroup;

export function initializeCalendarForm(): void {
  calendarForm.setValue({ id: '', projectId: null, name: '', description: '', isPublic: false, timeZone: '' });
}
export function extractCalendarUpdatesFromForm(): CalendarToUpdate {
  return {
    project: calendarForm.controls['projectId'].dirty ? calendarForm.controls['projectId'].value : undefined,
    name: calendarForm.controls['name'].dirty ? calendarForm.controls['name'].value : undefined,
    description: calendarForm.controls['description'].dirty ? calendarForm.controls['description'].value ?? '' : undefined,
    isPrivate: calendarForm.controls['isPublic'].dirty ? !calendarForm.controls['isPublic'].value : undefined,
    timeZone: calendarForm.controls['timeZone'].dirty ? calendarForm.controls['timeZone'].value : undefined,
  };
}

export function getFilterRes(columns: string[], data: CalendarDetails, filter: string) {
  let res = [];
  columns.forEach((col: string) => {
    const filteredData = col === 'project' ? data['projectName'] : col === 'isPublic' ? (data['isPrivate'] ? 'private' : 'public') : data[col];
    res = [...res, !filter || filteredData?.toString().trim().toLowerCase().includes(filter?.trim().toLowerCase())];
  });

  return res;
}

export function filterPredicate(data: CalendarDetails, filter: string, displayedColumns: string[]): boolean {
  const columns = displayedColumns?.filter(col => col !== 'actions');

  return getFilterRes(columns, data, filter).reduce((sum, next) => sum || next);
}

export function getNoItemsMsg(calendarsFiltersLength: number, filteredLeavesLength: number): string {
  return !calendarsFiltersLength && filteredLeavesLength
    ? 'CALENDAR_VIEW.RIGHT_BAR.NO_AVAILABLE_CALENDARS'
    : calendarsFiltersLength && !filteredLeavesLength
    ? 'CALENDAR_VIEW.RIGHT_BAR.NO_AVAILABLE_LEAVES'
    : !calendarsFiltersLength && !filteredLeavesLength
    ? 'CALENDAR_VIEW.RIGHT_BAR.NO_AVAILABLE_LEAVES_OR_CALENDARS'
    : '';
}
