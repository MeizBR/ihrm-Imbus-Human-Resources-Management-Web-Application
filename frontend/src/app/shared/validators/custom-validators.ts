import * as moment from 'moment';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { combineLatest } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

import validator from 'validator';

import { ErrorType } from './validation-error-type';

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  const validationErrors: ValidationErrors = {};
  validationErrors[ErrorType.EmailNotValid] = true;

  // NOTE: This validator to make sure of used characters => since there is an error get back from the backend, we don't need it
  // NOTE: To be discussed and verified
  // if (!control.value?.match('^[^ ]+@[^ ]+\\.[a-z]{2,3}$')) {
  //   console.log('validationErrors', validationErrors);

  //   return validationErrors;
  // }

  return control.value && !validator.isEmail(control.value) ? validationErrors : {};
}

export function trimmedValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  const validationFailed = value !== null && value !== undefined && value?.toString() !== value?.toString().trim();
  const validationErrors: ValidationErrors = {};
  validationErrors[ErrorType.NotTrimmed] = true;

  return control.value && validationFailed ? validationErrors : {};
}

export function noWhiteSpacesValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  const validationFailed = value !== null && value !== undefined && /[\s]+/.test(value);
  const validationErrors: ValidationErrors = {};
  validationErrors[ErrorType.WhiteSpaces] = true;

  return validationFailed ? validationErrors : {};
}

export function notOnlyWhiteSpacesValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value ? control.value : '';
  const validationError = value.replace(/\s/g, '').length === 0 && value.length > 0;
  const validationErrors: ValidationErrors = {};
  validationErrors[ErrorType.OnlyWhiteSpaces] = true;

  return validationError ? validationErrors : {};
}

export function checkPasswordMatch(control: AbstractControl): ValidatorFn {
  const password = control.get(['password']);
  const passwordConfirmed = control.get(['confirmPassword']);

  if (password && passwordConfirmed) {
    if (!passwordConfirmed.errors || passwordConfirmed.hasError('passwordMismatch')) {
      passwordConfirmed.setErrors(passwordConfirmed.value && password.value !== passwordConfirmed.value ? { passwordMismatch: true } : null);
    }
  }

  return null;
}

export function dateValidator(control: AbstractControl): ValidatorFn {
  const startDateControl = control.get(['start']);
  const endDateControl = control.get(['end']);
  const allDayControl = control.get(['allDay']);

  if (endDateControl && startDateControl) {
    endDateControl.setErrors(
      allDayControl?.value !== undefined && !allDayControl?.value && moment(startDateControl?.value, 'HH:mm').isSame(moment(endDateControl?.value, 'HH:mm'))
        ? { sameDateTime: true }
        : (!endDateControl?.value && startDateControl?.value) || !(endDateControl?.value || startDateControl?.value) // NOTE: verify this condition,
        ? { required: true }
        : null,
    );

    startDateControl.setErrors(
      endDateControl?.value && startDateControl?.value && endDateControl?.value < startDateControl?.value
        ? { lesserDate: true }
        : endDateControl?.value && !startDateControl?.value
        ? { mustSelectStartDate: true }
        : !(endDateControl?.value || startDateControl?.value)
        ? { required: true }
        : null,
    );
  }

  return null;
}

// NOTE: I define a validator to inform that the password of the connected user is required in case of password change
export function setPasswordValidator(connectedPasswordControl: AbstractControl, passwordControl: AbstractControl, confirmPassword: AbstractControl) {
  combineLatest([
    connectedPasswordControl.valueChanges.pipe(startWith(''), debounceTime(100)),
    passwordControl.valueChanges.pipe(startWith(''), debounceTime(100)),
    confirmPassword.valueChanges.pipe(startWith(''), debounceTime(100)),
  ]).subscribe(([connectedPass, newPass, confirmPass]) => {
    connectedPasswordControl.setErrors(!!newPass && !connectedPass ? { [ErrorType.YourPasswordRequired]: true } : null);

    passwordControl.setErrors(!newPass && connectedPasswordControl.touched && !connectedPass ? null : passwordControl.errors);
    confirmPassword.setErrors(!newPass && !connectedPass && !confirmPass ? null : confirmPassword.errors);
  });
}

// NOTE: A validator defined to inform that the user needs to define the connected password and confirm the new password before submission
export function setPasswordValidatorOnSubmit(connectedPasswordControl: AbstractControl, passwordControl: AbstractControl, confirmPassword: AbstractControl) {
  passwordControl.setErrors(!passwordControl.value && connectedPasswordControl.value ? { SetNewPass: true } : null);
  confirmPassword.setErrors(!!passwordControl.value && !confirmPassword.value ? { required: true } : null);
}
