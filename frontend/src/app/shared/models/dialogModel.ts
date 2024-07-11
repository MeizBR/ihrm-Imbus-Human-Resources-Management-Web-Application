import { FormGroup } from '@angular/forms';
import { ItemDetails, SelectBoxType } from './index';

export interface DialogModel {
  title?: string;
  form?: FormGroup;
  dataForm?: ItemDetails[];
  selectItems?: SelectBoxType;
  columns?: string[];
  initializeFormGroup?(): void;
}
