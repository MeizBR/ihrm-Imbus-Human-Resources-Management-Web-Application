import { ValidationErrors } from '@angular/forms';

// NOTE:
export interface BackendJsonError {
  errorCode: number;
  errorType: number;
}

export enum ErrorType {
  Required = 'required',
  PrintableCharacters = 'printableCharacters',
  NotTrimmed = 'notTrimmed',
  Minlength = 'minlength',
  Maxlength = 'maxlength',
  PasswordMismatch = 'passwordMismatch',
  EmailNotValid = 'emailNotValid',
  LoginExists = 'loginExists',
  EmailExists = 'emailExists',
  InvalidEmailFormat = 'invalidEmailFormat',
  EmailNotChanged = 'emailNotChanged',
  IncorrectPassword = 'incorrectPassword',
  OnlyWhiteSpaces = 'onlyWhiteSpaces',
  WhiteSpaces = 'whiteSpaces',
  NameAlreadyExists = 'NameAlreadyExists',
  GreaterDate = 'greaterDate',
  LesserDate = 'lesserDate',
  SameDateTime = 'sameDateTime',
  MustSelectStartDate = 'mustSelectStartDate',
  FieldValidationFailed = 'fieldValidationFailed',
  InternalServerError = 'internalServerError',
  Unauthorized = 'unauthorized',
  YourPasswordRequired = 'yourPasswordRequired',
  Forbidden = 'forbidden',
  WrongPassword = 'wrongPassword',
  SetNewPass = 'SetNewPass',
  NotPermittedToEditEvent = 'NotPermittedToEditEvent',
  LeaveWithSameDateExists = 'LeaveWithSameDateExists',
  WrongCredentials = 'WrongCredentials',
  InactiveUser = 'InactiveUser',
  SynchronizeDataIsNeeded = 'SynchronizeDataIsNeeded',
}

export namespace ErrorType {
  export function fromApiValue(value: BackendJsonError): ErrorType {
    switch (value?.errorCode) {
      case 401:
        if (value.errorType === 1000) {
          return ErrorType.WrongCredentials;
        } else if (value.errorType === 1001) {
          return ErrorType.InactiveUser;
        }
        break;

      case 422:
        if (value.errorType === 1006) {
          return ErrorType.InvalidEmailFormat;
        } else if (value.errorType === 1007) {
          return ErrorType.SynchronizeDataIsNeeded;
        }
        break;

      case 409:
        if (value.errorType === 1000) {
          return ErrorType.LoginExists;
        } else if (value.errorType === 1001) {
          return ErrorType.EmailExists;
        } else if (value.errorType === 1002) {
          return ErrorType.NameAlreadyExists;
        } else if (value.errorType === 1003) {
          return ErrorType.LeaveWithSameDateExists;
        }
        break;

      case 404:
        return ErrorType.InternalServerError;

      case 403:
        if (value.errorType === 1003) {
          return ErrorType.WrongPassword;
        }
        if (value.errorType === 1005) {
          return ErrorType.NotPermittedToEditEvent;
        }
        if (value.errorType === 1006) {
          return ErrorType.SynchronizeDataIsNeeded;
        } else {
          return ErrorType.Forbidden;
        }
      case 0:
        return ErrorType.InternalServerError;

      default:
        console.warn(`the value '${value}' not supported as a BackendJsonError !`);

        return ErrorType.InternalServerError;
    }
  }

  export function isDateContainsErrors(controlName: string, validationErrors: ValidationErrors | null): boolean {
    if (validationErrors) {
      const errors = Object.keys(validationErrors);

      switch (controlName) {
        case 'start':
          return !![ErrorType.LesserDate, ErrorType.MustSelectStartDate, ErrorType.LeaveWithSameDateExists].some(err => errors?.includes(err));

        case 'end':
          return !![ErrorType.SameDateTime, ErrorType.LeaveWithSameDateExists].some(err => errors?.includes(err));

        default:
          return null;
      }
    }
  }

  // tslint:disable-next-line:typedef
  export function getErrorMessage(validationErrors: ValidationErrors | null, placeholder = 'Text'): string | null {
    if (validationErrors) {
      const errors = Object.keys(validationErrors);

      if (errors.includes(ErrorType.Required)) {
        return placeholder + ' is required';
      } else if (errors.includes(ErrorType.PrintableCharacters)) {
        return 'Special characters are not allowed.';
      } else if (errors.includes(ErrorType.NotTrimmed)) {
        return 'Leading or trailing white spaces are not allowed.';
      } else if (errors.includes(ErrorType.Minlength)) {
        const minlength = validationErrors[ErrorType.Minlength].requiredLength;

        return `Minimum of ${minlength} characters are required.`;
      } else if (errors.includes(ErrorType.Maxlength)) {
        const maxlength = validationErrors[ErrorType.Maxlength].requiredLength;

        return `${placeholder} is too long, max of ${maxlength} characters are allowed.`;
      } else if (errors.includes(ErrorType.PasswordMismatch)) {
        return 'Passwords do not match.';
      } else if (errors.includes(ErrorType.EmailNotValid)) {
        return 'Email address not valid.';
      } else if (errors.includes(ErrorType.LoginExists)) {
        return 'Login already exists.';
      } else if (errors.includes(ErrorType.EmailExists)) {
        return 'Email already exists.';
      } else if (errors.includes(ErrorType.InvalidEmailFormat)) {
        return 'Invalid email format.';
      } else if (errors.includes(ErrorType.EmailNotChanged)) {
        return 'Please specify a different email address for updating your data.';
      } else if (errors.includes(ErrorType.IncorrectPassword)) {
        return 'Incorrect password.';
      } else if (errors.includes(ErrorType.OnlyWhiteSpaces)) {
        return 'The text must contain at least one printable character.';
      } else if (errors.includes(ErrorType.WhiteSpaces)) {
        return 'White spaces are not allowed.';
      } else if (errors.includes(ErrorType.NameAlreadyExists)) {
        return placeholder + ' already exists.';
      } else if (errors.includes(ErrorType.GreaterDate)) {
        return 'End date should be greater than the start date';
      } else if (errors.includes(ErrorType.LesserDate)) {
        return 'Start date should be lesser than the end date';
      } else if (errors.includes(ErrorType.InternalServerError)) {
        return 'Internal Server Error';
      } else if (errors.includes(ErrorType.MustSelectStartDate)) {
        return 'You should set the start date';
      } else if (errors.includes(ErrorType.SameDateTime)) {
        return 'Start date and End date shouldn\'t have the same time';
      } else if (errors.includes(ErrorType.Forbidden)) {
        return 'Forbidden or workspace not found';
      } else if (errors.includes(ErrorType.WrongPassword)) {
        return `Wrong ${placeholder} !! Verify your password`;
      } else if (errors.includes(ErrorType.SetNewPass)) {
        return 'You haven\'t set the new password';
      } else if (errors.includes(ErrorType.YourPasswordRequired)) {
        return 'You must first set your own password';
      } else if (errors.includes(ErrorType.NotPermittedToEditEvent)) {
        return 'Edit event not permitted. You\'re not the owner.';
      } else if (errors.includes(ErrorType.LeaveWithSameDateExists)) {
        return 'There is another leave on this date';
      } else if (errors.includes(ErrorType.SynchronizeDataIsNeeded)) {
        return 'Please reload the page to synchronize the data';
      } else {
        console.warn('Missing error mapping for', validationErrors);
        // NOTE: if you need any other type of validation message, just add them here.

        return 'Error occurred.';
      }
    }

    return null;
  }
}
