import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { RoleModel } from '../../shared/enum/role-model.enum';
import { TeamFormInput, UserDetailedPermissions, UserDetails, UserForUpdate } from '../../shared/models/index';
import { BackendJsonError, checkPasswordMatch, emailValidator, ErrorType, noWhiteSpacesValidator, trimmedValidator } from '../../shared/validators/index';

type TeamInputControls = { [key in keyof TeamFormInput]: AbstractControl };
type TeamInputFormGroup = FormGroup & { value: TeamFormInput; controls: TeamInputControls };

export const teamForm: FormGroup = new FormGroup(
  {
    id: new FormControl(null),
    firstName: new FormControl('', [Validators.required, trimmedValidator, Validators.maxLength(255), Validators.minLength(3)]),
    lastName: new FormControl('', [Validators.required, trimmedValidator, Validators.maxLength(255), Validators.minLength(3)]),
    login: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator, noWhiteSpacesValidator]),
    email: new FormControl('', [Validators.required, Validators.maxLength(255), emailValidator]),
    connectedPassword: new FormControl(''),
    password: new FormControl('', [Validators.minLength(6), Validators.maxLength(255), trimmedValidator, noWhiteSpacesValidator]),
    confirmPassword: new FormControl('', [Validators.minLength(6), Validators.maxLength(255), trimmedValidator, noWhiteSpacesValidator]),
    note: new FormControl(''),
    registrationNumber: new FormControl('', [Validators.required, trimmedValidator, Validators.maxLength(255)]),
    isActive: new FormControl(false),
  } as TeamInputControls,
  { validators: checkPasswordMatch },
) as TeamInputFormGroup;

export function initializeTeamFormGroup(editCardDetails?: UserDetails): void {
  teamForm.reset();
  teamForm.setValue({
    id: editCardDetails ? editCardDetails.id : '',
    firstName: editCardDetails ? editCardDetails.firstName : '',
    lastName: editCardDetails ? editCardDetails.lastName : '',
    login: editCardDetails ? editCardDetails.login : '',
    email: editCardDetails ? editCardDetails.email : '',
    connectedPassword: '',
    password: '',
    confirmPassword: '',
    note: editCardDetails ? editCardDetails.note : '',
    registrationNumber: editCardDetails ? editCardDetails.registrationNumber : '',
    isActive: editCardDetails ? editCardDetails.isActive : '',
  });
}

export function initializePassFormControls(): void {
  teamForm.controls['password'].reset();
  teamForm.controls['confirmPassword'].reset();
  teamForm.controls['connectedPassword'].reset();
}

export const displayedTeamColumns: string[] = ['globalRoles', 'user', 'login', 'email', 'registrationNumber', 'active', 'actions'];
export const teamColumns = [
  {
    matColumnDef: 'globalRoles',
    headerName: '',
    attribute: 'globalRoles',
  },
  {
    matColumnDef: 'user',
    headerName: 'TEAM_VIEW.USERS_LIST.USER',
    attribute: 'user',
  },
  {
    matColumnDef: 'login',
    headerName: 'TEAM_VIEW.USERS_LIST.LOGIN',
    attribute: 'login',
  },
  {
    matColumnDef: 'email',
    headerName: 'TEAM_VIEW.USERS_LIST.EMAIL',
    attribute: 'email',
  },
  {
    matColumnDef: 'registrationNumber',
    headerName: 'TEAM_VIEW.USERS_LIST.REGISTRATION_NUMBER',
    attribute: 'registrationNumber',
  },
  {
    matColumnDef: 'active',
    headerName: 'TEAM_VIEW.USERS_LIST.ACTIVE',
    attribute: 'active',
  },
];

export function extractUserUpdatesFromForm(): UserForUpdate {
  return {
    id: teamForm.controls['id'].value,
    firstName: teamForm.controls['firstName'].dirty ? teamForm.controls['firstName'].value : undefined,
    lastName: teamForm.controls['lastName'].dirty ? teamForm.controls['lastName'].value : undefined,
    login: teamForm.controls['login'].dirty ? teamForm.controls['login'].value : undefined,
    email: teamForm.controls['email'].dirty ? teamForm.controls['email'].value : undefined,
    password:
      teamForm.controls['connectedPassword']?.dirty && teamForm.controls['password']?.dirty
        ? {
            connectedPassword: teamForm.controls['connectedPassword']?.dirty ? teamForm.controls['connectedPassword'].value : undefined,
            newPassword: teamForm.controls['password']?.dirty ? teamForm.controls['password'].value : undefined,
          }
        : undefined,
    note: teamForm.controls['note'].dirty ? teamForm.controls['note'].value ?? '' : undefined,
    registrationNumber: teamForm.controls['registrationNumber'].dirty ? teamForm.controls['registrationNumber'].value ?? '' : undefined,
    isActive: teamForm.controls['isActive'].dirty ? teamForm.controls['isActive'].value : undefined,
  };
}

export function handleError(errorType: ErrorType | undefined, form: FormGroup): void {
  // tslint:disable-next-line:switch-default
  switch (errorType) {
    case ErrorType.LoginExists:
      form.controls['login'].setErrors({ [ErrorType.LoginExists]: true });
      break;

    case ErrorType.EmailExists:
      form.controls['email'].setErrors({ [ErrorType.EmailExists]: true });
      break;

    case ErrorType.WrongPassword:
      form.controls['connectedPassword'].setErrors({ [ErrorType.WrongPassword]: true });
      break;

    case ErrorType.InvalidEmailFormat:
      form.controls['email'].setErrors({ [ErrorType.EmailNotValid]: true });
      break;
  }
}

// NOTE: to be removed when the backend returns the errorType as a number
export function getBackendJsonError(error: HttpErrorResponse): BackendJsonError {
  const backendJsonError: BackendJsonError = {
    errorCode: error.status,
    errorType: null,
  };
  switch (error.status) {
    case 409:
      if (error.error.failureType === 'Login already exists.') {
        return { ...backendJsonError, errorType: 1000 };
      } else if (error.error.failureType === 'Email already exists.') {
        return { ...backendJsonError, errorType: 1001 };
      }
      break;

    case 403:
      return { ...backendJsonError, errorType: 1003 };

    case 422:
      if (error.error.failureType === 'Invalid email format.') {
        return { ...backendJsonError, errorType: 1006 };
      }
      break;

    default:
      return null;
  }
}

export function getGlobalRoles(sourceId: string, userDetails: UserDetailedPermissions, isAdministrator: boolean, isAccountManager: boolean): RoleModel[] {
  switch (sourceId) {
    case 'administrator':
      return isAdministrator
        ? userDetails.globalRoles
          ? [...userDetails?.globalRoles, RoleModel.Administrator]
          : [RoleModel.Administrator]
        : userDetails?.globalRoles?.filter(role => role !== RoleModel.Administrator);
    case 'accountManager':
      return isAccountManager
        ? userDetails.globalRoles
          ? [...userDetails?.globalRoles, RoleModel.AccountManager]
          : [RoleModel.AccountManager]
        : userDetails?.globalRoles?.filter(role => role !== RoleModel.AccountManager);
    default:
      break;
  }
}

export function getConfirmSettingRoleTitle(sourceId: string, isAdministrator: boolean, isAccountManager: boolean): string {
  return (sourceId === 'administrator' && !isAdministrator) || (sourceId === 'accountManager' && !isAccountManager) ? 'SET_GLOBAL_ROLE_TITLE' : 'REMOVE_GLOBAL_ROLE_TITLE';
}

export function getConfirmSettingRoleMessage(sourceId: string, isAdministrator: boolean, isAccountManager: boolean): string {
  return sourceId === 'administrator' && !isAdministrator
    ? 'TEAM_VIEW.SET_AS_ADMINISTRATOR_MESSAGE'
    : sourceId === 'administrator' && isAdministrator
    ? 'TEAM_VIEW.REMOVE_ADMINISTRATOR_ROLE_MESSAGE'
    : sourceId === 'accountManager' && !isAccountManager
    ? 'TEAM_VIEW.SET_AS_ACCOUNT_MANAGER_MESSAGE'
    : 'TEAM_VIEW.REMOVE_ACCOUNT_MANAGER_ROLE_MESSAGE';
}

export function getConfirmDeleteUserMessage(isAdministrator: boolean, isAccountManager: boolean): string {
  return isAdministrator && isAccountManager
    ? 'TEAM_VIEW.DELETE_ADMIN_ACCOUNT_MANAGER_MESSAGE'
    : isAdministrator
    ? 'TEAM_VIEW.DELETE_ADMIN_MESSAGE'
    : isAccountManager
    ? 'TEAM_VIEW.DELETE_ACCOUNT_MANAGER_MESSAGE'
    : 'TEAM_VIEW.DELETE_USER_MESSAGE';
}
