import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { Field } from '../../shared/enum/create-items.enum';
import { trimmedValidator } from '../../shared/validators/custom-validators';
import { Column, ItemDetails, ProjectDetails } from '../../shared/models/index';

export const projectsDataForm: ItemDetails[] = [
  { fieldName: Field.Customers, name: 'customer', translatedName: 'PROJECTS_VIEW.CUSTOMER_NAME', isInput: false, isCheckBox: false, isSelect: true, id: 'customer' },
  { name: 'name', translatedName: 'PROJECTS_VIEW.PROJECT_NAME', isInput: true, isCheckBox: false, isSelect: false, value: 'name', id: 'name' },
  { name: 'description', translatedName: 'PROJECTS_VIEW.DESCRIPTION', isInput: true, isCheckBox: false, isSelect: false, value: 'description', id: 'description' },
  { name: 'isActive', translatedName: 'PROJECTS_VIEW.ACTIVE', isInput: false, isCheckBox: true, isChecked: false, isSelect: false, value: 'false', id: 'isActive' },
];

type ProjectInputControls = { [key in keyof ProjectDetails]: AbstractControl };
type ProjectInputFormGroup = FormGroup & { value: ProjectDetails; controls: ProjectInputControls };
export const projectsForm: FormGroup = new FormGroup({
  id: new FormControl(null),
  customerId: new FormControl('', Validators.required),
  name: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
  description: new FormControl(''),
  isActive: new FormControl(false),
} as ProjectInputControls) as ProjectInputFormGroup;

export function initializeProjectFormGroup(): void {
  projectsForm.setValue({ id: '', customerId: '', name: '', description: '', isActive: false });
}

export const displayedProjectColumns: string[] = ['name', 'customer', 'active', 'actions'];
export const projectColumns: Column[] = [
  { matColumnDef: 'customer', headerName: 'PROJECTS_VIEW.PROJECT_LIST.CUSTOMER', attribute: 'customer' },
  { matColumnDef: 'name', headerName: 'PROJECTS_VIEW.PROJECT_LIST.NAME', attribute: 'name' },
  { matColumnDef: 'active', headerName: 'PROJECTS_VIEW.PROJECT_LIST.ACTIVE', attribute: 'active' },
];

export function extractProjectUpdatesFromForm(): ProjectDetails {
  return {
    id: projectsForm.controls['id'].value,
    customerId: projectsForm.controls['customerId'].dirty ? projectsForm.controls['customerId'].value : undefined,
    name: projectsForm.controls['name'].dirty ? projectsForm.controls['name'].value : undefined,
    description: projectsForm.controls['description'].dirty ? projectsForm.controls['description'].value ?? '' : undefined,
    isActive: projectsForm.controls['isActive'].dirty ? projectsForm.controls['isActive'].value : undefined,
  };
}
