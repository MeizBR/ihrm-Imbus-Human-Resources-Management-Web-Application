import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { CreateItemComponent } from './create-item.component';
import { ItemDetails, SelectBoxType } from '../../models/index';

export function matDialogConfig(
  dialog?: MatDialog,
  title?: string,
  form?: FormGroup,
  dataForm?: ItemDetails[],
  initializeFormGroup?: () => void,
  selectItems?: SelectBoxType,
): MatDialogRef<CreateItemComponent> {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.width = '20%';
  dialogConfig.panelClass = 'dialog-container';
  dialogConfig.data = { title, form, dataForm, initializeFormGroup, selectItems };

  const dialogRef = dialog.open(CreateItemComponent, dialogConfig);

  return dialogRef;
}
