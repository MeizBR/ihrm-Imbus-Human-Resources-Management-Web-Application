import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { handleError } from '../../team-helpers';
import { UserForAdd } from '../../../../shared/models';
import { checkPasswordMatch, emailValidator, ErrorType, noWhiteSpacesValidator, trimmedValidator } from '../../../../shared/validators/index';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnChanges {
  @Input() error: ErrorType | undefined;
  @Input() isUsersLoading: boolean | undefined;
  @Output() onAdd = new EventEmitter<UserForAdd>();

  public addUserForm: FormGroup;
  public formVisibility = false;

  public ErrorType = ErrorType;

  public showPassword = false;
  public showConfirmPassword = false;
  public showTextButton = 'Show text';
  public hideTextButton = 'Hide text';

  constructor(private formBuilder: FormBuilder) {
    this.addUserForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, trimmedValidator, Validators.maxLength(255), Validators.minLength(3)]],
        lastName: ['', [Validators.required, trimmedValidator, Validators.maxLength(255), Validators.minLength(3)]],
        login: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator, noWhiteSpacesValidator]],
        email: ['', [Validators.required, Validators.maxLength(255), emailValidator]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
        registrationNumber: ['', [Validators.required, trimmedValidator]],
        isActive: [false],
      },
      { validator: checkPasswordMatch },
    );
  }

  ngOnChanges(): void {
    if (!this.error && !this.isUsersLoading) {
      this.close();
    } else {
      handleError(this.error, this.addUserForm);
    }
  }

  public close(): void {
    this.formVisibility = false;
    this.resetAddUserForm();
  }

  public onSubmit(): void {
    if (this.addUserForm.valid) {
      this.onAdd.emit({
        firstName: this.addUserForm.controls['firstName'].value,
        lastName: this.addUserForm.controls['lastName'].value,
        login: this.addUserForm.controls['login'].value,
        email: this.addUserForm.controls['email'].value,
        password: this.addUserForm.controls['password'].value,
        registrationNumber: this.addUserForm.controls['registrationNumber'].value,
        isActive: this.addUserForm.controls['isActive'].value,
      });
    }
  }

  private resetAddUserForm(): void {
    this.addUserForm.reset();
    this.addUserForm.setValue({
      firstName: '',
      lastName: '',
      login: '',
      email: '',
      password: '',
      confirmPassword: '',
      registrationNumber: '',
      isActive: false,
    });
  }
}
