import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatExpansionPanel } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { QuillModule } from 'ngx-quill';

import { EditProfileCardComponent } from './edit-profile-card.component';

import { teamForm } from '../../team-helpers';

import { ErrorType } from '../../../../shared/validators/index';
import { UserDetailedPermissions } from '../../../../shared/models/user-models/userDetails';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('EditProfileCardComponent', () => {
  let component: EditProfileCardComponent;
  let fixture: ComponentFixture<EditProfileCardComponent>;

  const editCardDetails: UserDetailedPermissions = {
    id: 1,
    firstName: 'Hejer',
    lastName: 'Ayedi',
    login: 'admin',
    email: 'admin@gmail.com',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: true,
    userPermissions: {
      canEdit: true,
      seeRoles: true,
      canDelete: true,
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BrowserAnimationsModule, QuillModule.forRoot(), AngularMaterialModule, FormsModule, ReactiveFormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileCardComponent);
    component = fixture.componentInstance;
    component.editCardDetails = editCardDetails;
    component.editPassword = true;
    component.form = teamForm;
    component.isAdministratorConnectedUser = true;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain the correct containers of component', () => {
    const profileCardContainer = fixture.debugElement.query(By.css('.profile-card'));
    expect(profileCardContainer).toBeTruthy();

    const profileCardContent = fixture.debugElement.query(By.css('.card-content'));
    const createUserFormDiv = fixture.debugElement.query(By.css('.create-user-form'));
    const createUserForm = fixture.debugElement.query(By.css('form'));

    expect(profileCardContent).toBeTruthy();
    expect(createUserFormDiv).toBeTruthy();
    expect(createUserFormDiv.nativeElement.childElementCount).toEqual(1);

    expect(createUserForm).toBeTruthy();
    expect(createUserForm.name).toEqual('form');
    expect(createUserForm.nativeElement.childElementCount).toEqual(3);
  });

  it('should display the detailed profile inputs correctly', () => {
    component.editPassword = false;
    fixture.detectChanges();

    const detailsInputRow = fixture.debugElement.query(By.css('.details-input-div'));
    expect(detailsInputRow).toBeTruthy();
    expect(detailsInputRow.nativeElement.childElementCount).toEqual(4);

    // First name
    const firstNameDiv = fixture.debugElement.query(By.css('.first-name-div'));
    expect(firstNameDiv).toBeTruthy();
    expect(firstNameDiv.nativeElement.childElementCount).toEqual(2);

    const firstNameLabel = fixture.debugElement.query(By.css('.first-name-div mat-label'));
    expect(firstNameLabel).toBeTruthy();
    expect(firstNameLabel.nativeElement.textContent).toEqual('TEAM_VIEW.EDIT_PROFILE.FIRST_NAME :');

    const firstNameInput = fixture.debugElement.query(By.css('.first-name-div input'));
    expect(firstNameInput).toBeTruthy();

    firstNameInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['firstName'].setValue(' false name ');
    fixture.detectChanges();

    const firstNameErrorHint = fixture.debugElement.query(By.css('.first-name-div .first-name-error-hint'));

    expect(firstNameErrorHint).toBeTruthy();
    expect(firstNameErrorHint.nativeElement.innerText).toEqual('Leading or trailing white spaces are not allowed.');

    // Last name
    const lastNameDiv = fixture.debugElement.query(By.css('.last-name-div'));
    expect(lastNameDiv).toBeTruthy();
    expect(lastNameDiv.nativeElement.childElementCount).toEqual(2);

    const lastNameLabel = fixture.debugElement.query(By.css('.last-name-div mat-label'));
    expect(lastNameLabel).toBeTruthy();
    expect(lastNameLabel.nativeElement.textContent).toEqual('TEAM_VIEW.EDIT_PROFILE.LAST_NAME :');

    const lastNameInput = fixture.debugElement.query(By.css('.last-name-div input'));
    expect(lastNameInput).toBeTruthy();

    lastNameInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['lastName'].setValue(' false name ');
    fixture.detectChanges();

    const lastNameErrorHint = fixture.debugElement.query(By.css('.last-name-div .last-name-error-hint'));

    expect(lastNameErrorHint).toBeTruthy();
    expect(lastNameErrorHint.nativeElement.innerText).toEqual('Leading or trailing white spaces are not allowed.');

    // Login
    const loginDiv = fixture.debugElement.query(By.css('.login-div'));
    expect(loginDiv).toBeTruthy();
    expect(loginDiv.nativeElement.childElementCount).toEqual(2);

    const loginLabel = fixture.debugElement.query(By.css('.login-div mat-label'));
    expect(loginLabel).toBeTruthy();
    expect(loginLabel.nativeElement.textContent).toEqual('TEAM_VIEW.EDIT_PROFILE.LOGIN :');

    const loginInput = fixture.debugElement.query(By.css('.login-div input'));
    expect(loginInput).toBeTruthy();

    loginInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['login'].setValue(' false login ');
    fixture.detectChanges();

    const loginErrorHint = fixture.debugElement.query(By.css('.login-div .login-error-hint'));

    expect(loginErrorHint).toBeTruthy();
    expect(loginErrorHint.nativeElement.innerText).toEqual('Leading or trailing white spaces are not allowed.');

    // Email
    const emailDiv = fixture.debugElement.query(By.css('.email-div'));
    expect(emailDiv).toBeTruthy();

    const emailLabel = fixture.debugElement.query(By.css('.email-div mat-label'));
    expect(emailLabel).toBeTruthy();
    expect(emailLabel.nativeElement.textContent).toEqual('TEAM_VIEW.EDIT_PROFILE.EMAIL :');

    const emailInput = fixture.debugElement.query(By.css('.email-div input'));
    expect(emailInput).toBeTruthy();

    emailInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['email'].setValue('email');
    fixture.detectChanges();

    const emailErrorHint = fixture.debugElement.query(By.css('.email-div .email-error-hint'));
    expect(emailErrorHint).toBeTruthy();
    expect(emailErrorHint.nativeElement.innerText).toEqual('Email address not valid.');

    // Password
    const editPassPanel = fixture.debugElement.query(By.css('mat-expansion-panel'));
    const spyOnTogglePasswordFields = spyOn(component, 'togglePasswordFields').and.callThrough();
    expect(editPassPanel).toBeDefined();

    let passDiv = fixture.debugElement.query(By.css('.pass-div'));
    expect(passDiv).toBeTruthy();

    const aa: MatExpansionPanel = editPassPanel.componentInstance;
    aa.open();
    fixture.detectChanges();
    aa.close();
    fixture.detectChanges();
    expect(spyOnTogglePasswordFields).toHaveBeenCalled();

    passDiv = fixture.debugElement.query(By.css('.pass-div'));
    expect(passDiv).toBeDefined();

    const connectedPasswordSection = fixture.debugElement.query(By.css('.connected-password-section'));
    expect(connectedPasswordSection).toBeTruthy();

    const connectedPasswordInput = fixture.debugElement.query(By.css('[formControlName="connectedPassword"]'));
    expect(connectedPasswordInput).toBeTruthy();
    expect(connectedPasswordInput.attributes.placeholder).toEqual('TEAM_VIEW.EDIT_PROFILE.CONNECTED_PASSWORD');

    const newPasswordSection = fixture.debugElement.query(By.css('.new-password-section'));
    expect(newPasswordSection).toBeTruthy();

    const newPasswordDiv = fixture.debugElement.query(By.css('.new-password'));
    expect(newPasswordDiv).toBeTruthy();

    const newPassInput = fixture.debugElement.query(By.css('[formControlName="password"]'));
    expect(newPassInput).toBeTruthy();
    expect(newPassInput.attributes.placeholder).toEqual('TEAM_VIEW.EDIT_PROFILE.NEW_PASSWORD');

    const confirmPasswordDiv = fixture.debugElement.query(By.css('.confirm-password'));
    expect(confirmPasswordDiv).toBeTruthy();

    const confirmPassInput = fixture.debugElement.query(By.css('[formControlName="confirmPassword"]'));
    expect(confirmPassInput).toBeTruthy();
    expect(confirmPassInput.attributes.placeholder).toEqual('TEAM_VIEW.EDIT_PROFILE.CONFIRM_PASSWORD');

    // registration number
    const registrationNumDiv = fixture.debugElement.query(By.css('.registration-number-div'));
    expect(registrationNumDiv).toBeTruthy();

    const registrationNumLabel = fixture.debugElement.query(By.css('.registration-number-div mat-label'));
    expect(registrationNumLabel).toBeTruthy();
    expect(registrationNumLabel.nativeElement.textContent).toEqual('TEAM_VIEW.EDIT_PROFILE.REGISTRATION_NUMBER :');

    const registrationNumInput = fixture.debugElement.query(By.css('.registration-number-div input'));
    expect(registrationNumInput).toBeTruthy();

    registrationNumInput.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const registrationNumErrorHint = fixture.debugElement.query(By.css('.registration-number-div .registration-number-error-hint'));
    expect(registrationNumErrorHint).toBeTruthy();
    expect(registrationNumErrorHint.nativeElement.innerText).toEqual('Registration Number is required');

    // Is active
    const checkboxDiv = fixture.debugElement.query(By.css('.checkbox-div'));
    expect(checkboxDiv).toBeTruthy();
    expect(checkboxDiv.nativeElement.childElementCount).toEqual(2);

    const checkboxLabel = fixture.debugElement.query(By.css('.checkbox-div mat-label'));
    expect(checkboxLabel).toBeTruthy();
    expect(checkboxLabel.nativeElement.textContent).toEqual('TEAM_VIEW.EDIT_PROFILE.ACTIVE');

    const checkboxInput = fixture.debugElement.query(By.css('.checkbox-div input'));
    expect(checkboxInput).toBeTruthy();
  });

  it('should display the detailed row data correctly', () => {
    const noteDiv = fixture.debugElement.query(By.css('.note-richText-div'));
    expect(noteDiv).toBeTruthy();
    expect(noteDiv.nativeElement.childElementCount).toEqual(2);

    const noteLabel = fixture.debugElement.query(By.css('.note-label'));
    expect(noteLabel).toBeTruthy();
    expect(noteLabel.nativeElement.textContent).toEqual('TEAM_VIEW.EDIT_PROFILE.NOTE :');

    const noteRichText = fixture.debugElement.query(By.css('.note-richText-editor'));
    expect(noteRichText).toBeTruthy();
  });

  it('Password validator should work correctly', () => {
    const connectedPassword = component.form.get('connectedPassword');
    const password = component.form.get('password');
    connectedPassword.setValue('connectedPassword');
    password.setValue('pass');
    connectedPassword.markAsTouched();
    connectedPassword.markAsDirty();
    password.markAsTouched();
    password.markAsDirty();

    fixture.detectChanges();

    expect(password.valid).toEqual(false);
    expect(password.hasError(ErrorType.Minlength)).toBe(true);
    expect(ErrorType.getErrorMessage(password.errors)).toEqual('Minimum of 6 characters are required.');

    password.setValue(
      `isName_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_
        very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    password.markAsTouched();
    fixture.detectChanges();

    expect(password.valid).toEqual(false);
    expect(password.hasError(ErrorType.Maxlength)).toBe(true);
    expect(password.errors[ErrorType.Maxlength].requiredLength).toEqual(255);
    expect(ErrorType.getErrorMessage(password.errors)).toEqual('Text is too long, max of 255 characters are allowed.');
  });

  it('Confirm password validator should work correctly', () => {
    const password = component.form.get('password');
    const confirmPassword = component.form.get('confirmPassword');
    password.patchValue('newPass');
    confirmPassword.patchValue('password');
    fixture.detectChanges();

    expect(confirmPassword.valid).toEqual(false);
    expect(confirmPassword.hasError(ErrorType.PasswordMismatch)).toBe(true);
    expect(ErrorType.getErrorMessage(confirmPassword.errors)).toEqual('Passwords do not match.');
  });

  it('should update the user details related to form data', () => {
    const loginInput = fixture.debugElement.query(By.css('.login-div input'));
    const emailInput = fixture.debugElement.query(By.css('.email-div input'));
    const connectedPasswordInput = fixture.debugElement.query(By.css('[formControlName="connectedPassword"]'));
    const newPassInput = fixture.debugElement.query(By.css('[formControlName="password"]'));
    const confirmPassInput = fixture.debugElement.query(By.css('[formControlName="confirmPassword"]'));
    const checkboxInput = fixture.debugElement.query(By.css('.checkbox-div input'));

    const saveButton = fixture.debugElement.query(By.css('.save-button'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));

    component.editCardDetails = editCardDetails;
    component.isAdministratorConnectedUser = true;
    component.ngOnChanges({ editCardDetails: new SimpleChange(editCardDetails, undefined, true) });
    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.dirty).toEqual(false);
    expect(component.form.controls['firstName'].value).toEqual('Hejer');
    expect(component.form.controls['lastName'].value).toEqual('Ayedi');
    expect(component.form.controls['login'].value).toEqual('admin');
    expect(component.form.controls['email'].value).toEqual('admin@gmail.com');
    expect(component.form.controls['connectedPassword'].value).toEqual('');
    expect(component.form.controls['password'].value).toEqual('');
    expect(component.form.controls['confirmPassword'].value).toEqual('');
    expect(component.form.controls['registrationNumber'].value).toEqual(1500);

    expect(component.form.controls['isActive'].value).toEqual(true);
    expect(saveButton.attributes.disabled).toBeTruthy();
    expect(cancelButton.attributes.disabled).toBeTruthy();

    loginInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['login'].setValue('new admin');

    emailInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['email'].setValue('newadmin@gmail.com');

    connectedPasswordInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['connectedPassword'].setValue('connectedPass');

    newPassInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['password'].setValue('newPass');

    confirmPassInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['confirmPassword'].setValue('newPass');

    checkboxInput.nativeElement.click();

    fixture.detectChanges();

    expect(component.form.valid).toEqual(false);
    expect(component.form.dirty).toEqual(true);
    expect(component.form.controls['firstName'].value).toEqual('Hejer');
    expect(component.form.controls['lastName'].value).toEqual('Ayedi');
    expect(component.form.controls['login'].value).toEqual('new admin');
    expect(component.form.controls['email'].value).toEqual('newadmin@gmail.com');
    expect(component.form.controls['password'].value).toEqual('newPass');
    expect(component.form.controls['registrationNumber'].value).toEqual(1500);

    expect(component.form.controls['isActive'].value).toEqual(false);
    expect(saveButton.attributes.disabled).toBeTruthy();

    component.form.controls['login'].setValue('login');
    fixture.detectChanges();

    expect(loginInput.nativeElement.value).toEqual('login');
    expect(cancelButton.attributes.disabled).toBeFalsy();
  });
});
