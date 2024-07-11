import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { trimmedValidator } from '../../shared/validators/index';
import { CustomerDetails, CustomerForUpdate, ItemDetails } from '../../shared/models/index';

export const customersDataForm: ItemDetails[] = [
  {
    name: 'name',
    translatedName: 'CUSTOMERS_VIEW.CUSTOMER_NAME',
    isInput: true,
    isCheckBox: false,
    isSelect: false,
    value: 'name',
  },
  {
    name: 'description',
    translatedName: 'CUSTOMERS_VIEW.DESCRIPTION',
    isInput: true,
    isCheckBox: false,
    isSelect: false,
    value: 'description',
  },
  {
    name: 'active',
    translatedName: 'CUSTOMERS_VIEW.ACTIVE',
    isInput: false,
    isCheckBox: true,
    isChecked: false,
    isSelect: false,
    value: 'false',
  },
];

type CustomerInputControls = { [key in keyof CustomerDetails]: AbstractControl };
type CustomerInputFormGroup = FormGroup & { value: CustomerDetails; controls: CustomerInputControls };
export const customersForm: FormGroup = new FormGroup({
  id: new FormControl(null),
  name: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
  description: new FormControl(''),
  isActive: new FormControl(false),
} as CustomerInputControls) as CustomerInputFormGroup;

export function initializeCustomerFormGroup(): void {
  customersForm.setValue({
    id: '',
    name: '',
    description: '',
    isActive: false,
  });
}
export const displayedCustomerColumns: string[] = ['name', 'active', 'actions'];
export const customersColumns = [
  {
    matColumnDef: 'name',
    headerName: 'CUSTOMERS_VIEW.CUSTOMER_LIST.NAME',
    attribute: 'name',
  },
  {
    matColumnDef: 'active',
    headerName: 'CUSTOMERS_VIEW.CUSTOMER_LIST.ACTIVE',
    attribute: 'active',
  },
];

export function extractCustomerUpdatesFromForm(): CustomerForUpdate {
  return {
    name: customersForm.controls['name'].dirty ? customersForm.controls['name'].value : undefined,
    description: customersForm.controls['description'].dirty ? customersForm.controls['description'].value ?? '' : undefined,
    isActive: customersForm.controls['isActive'].dirty ? customersForm.controls['isActive'].value : undefined,
  };
}
