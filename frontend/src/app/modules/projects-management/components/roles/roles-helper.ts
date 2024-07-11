import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SelectBoxItems } from '../../../../shared/models';
import { Field } from '../../../../shared/enum/create-items.enum';
import { ItemDetails } from '../../../../shared/models/itemDetails';

export const rolesForm: FormGroup = new FormGroup({
  user: new FormControl('', Validators.required),
  selectedRoles: new FormControl([], Validators.required),
});

export const rolesDataForm: ItemDetails[] = [
  {
    fieldName: Field.Users,
    name: 'user',
    translatedName: 'PROJECTS_VIEW.ROLES.USER',
    isInput: false,
    isCheckBox: false,
    isSelect: true,
    value: 'user',
  },
  {
    fieldName: Field.Roles,
    name: 'roles',
    translatedName: 'PROJECTS_VIEW.ROLES.ROLE',
    isInput: false,
    isCheckBox: false,
    isChecked: false,
    isSelect: true,
    value: 'roles',
    multiple: true,
  },
];

export const displayedRolesColumns: string[] = ['user', 'roles', 'actions'];
export const rolesColumns = [
  {
    matColumnDef: 'user',
    headerName: 'user',
    attribute: 'user',
  },
  {
    matColumnDef: 'roles',
    headerName: 'roles',
    attribute: 'roles',
  },
];

export function _filterRoles(value: string, array: string[]): string[] {
  return array.filter(role => role.toLowerCase().indexOf(value) === 0);
}

export function _filterUsers(value: string, users: SelectBoxItems[]): SelectBoxItems[] {
  return users.filter(user => user.name.toLowerCase().indexOf(value) === 0);
}
