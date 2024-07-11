import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { ColumnDetails } from '../../../shared/models/columnDetails';
import { AddProgressColumnComponent } from './add-progress-column.component';

type ColumnDetailsControls = { [key in keyof ColumnDetails]: AbstractControl };
type ColumnDetailsFormGroup = FormGroup & { value: ColumnDetails; controls: ColumnDetailsControls };

export const columnForm: FormGroup = new FormGroup({
  id: new FormControl(null),
  columnName: new FormControl('', [Validators.required]),
  index: new FormControl('', [Validators.required]),
} as ColumnDetailsControls) as ColumnDetailsFormGroup;

export function initializeColumnFormGroup(): void {
  columnForm.setValue({
    id: null,
    columnName: '',
    index: '',
  });
}

export function KanbanColumnDialogConfig(
  dialog?: MatDialog,
  title?: string,
  form?: FormGroup,
  columns?: string[],
  initializeFormGroup?: () => void,
): MatDialogRef<AddProgressColumnComponent> {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.width = '30%';
  dialogConfig.panelClass = 'dialog-container';
  dialogConfig.data = { title, form, columns, initializeFormGroup };
  const dialogRef = dialog.open(AddProgressColumnComponent, dialogConfig);

  return dialogRef;
}
