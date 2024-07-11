import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { AddUserComponent } from './add-user.component';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, ReactiveFormsModule, FormsModule, BrowserAnimationsModule, TranslateModule.forRoot()],
      declarations: [AddUserComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display element correctly', () => {
    component.formVisibility = false;
    fixture.detectChanges();

    let addButton = fixture.debugElement.query(By.css('.button-container'));
    let formContainer = fixture.debugElement.query(By.css('.add-user'));

    expect(addButton).toBeTruthy();
    expect(formContainer).toBeFalsy();

    component.formVisibility = true;
    fixture.detectChanges();

    addButton = fixture.debugElement.query(By.css('.button-container'));
    formContainer = fixture.debugElement.query(By.css('.add-user'));

    expect(addButton).toBeFalsy();
    expect(formContainer).toBeTruthy();
  });

  it('should display the add user form inputs correctly', () => {
    component.formVisibility = true;
    fixture.detectChanges();

    // firstName Field
    const firstNameField = fixture.debugElement.query(By.css('[formControlName=firstName]'));
    expect(firstNameField).toBeTruthy();

    const firstNameLabel = fixture.debugElement.query(By.css('[data-test=first-name-label]'));
    expect(firstNameLabel).toBeTruthy();
    expect(firstNameLabel.nativeElement.textContent).toEqual('TEAM_VIEW.FIRST_NAME');

    // lastName Field
    const lastNameField = fixture.debugElement.query(By.css('[formControlName=lastName]'));
    expect(lastNameField).toBeTruthy();

    const lastNameLabel = fixture.debugElement.query(By.css('[data-test=last-name-label]'));
    expect(lastNameLabel).toBeTruthy();
    expect(lastNameLabel.nativeElement.textContent).toEqual('TEAM_VIEW.LAST_NAME');

    // login Field
    const loginField = fixture.debugElement.query(By.css('[formControlName=login]'));
    expect(loginField).toBeTruthy();

    const loginLabel = fixture.debugElement.query(By.css('[data-test=login-label]'));
    expect(loginLabel).toBeTruthy();
    expect(loginLabel.nativeElement.textContent).toEqual('TEAM_VIEW.LOGIN');

    // email Field
    const emailField = fixture.debugElement.query(By.css('[formControlName=email]'));
    expect(emailField).toBeTruthy();

    const emailLabel = fixture.debugElement.query(By.css('[data-test=email-label]'));
    expect(emailLabel).toBeTruthy();
    expect(emailLabel.nativeElement.textContent).toEqual('TEAM_VIEW.EMAIL');

    // password Field
    const passwordField = fixture.debugElement.query(By.css('[formControlName=password]'));
    expect(passwordField).toBeTruthy();

    const passwordLabel = fixture.debugElement.query(By.css('[data-test=password-label]'));
    expect(passwordLabel).toBeTruthy();
    expect(passwordLabel.nativeElement.textContent).toEqual('TEAM_VIEW.PASSWORD');

    // confirm password Field
    const passwordConfirmedField = fixture.debugElement.query(By.css('[formControlName=confirmPassword]'));
    expect(passwordConfirmedField).toBeTruthy();

    const confirmPasswordLabel = fixture.debugElement.query(By.css('[data-test=confirm-password-label]'));
    expect(confirmPasswordLabel).toBeTruthy();
    expect(confirmPasswordLabel.nativeElement.textContent).toEqual('TEAM_VIEW.CONFIRM_PASSWORD');

    // registration number Field
    const registrationNumField = fixture.debugElement.query(By.css('[formControlName=registrationNumber]'));
    expect(registrationNumField).toBeTruthy();

    const registrationNumLabel = fixture.debugElement.query(By.css('[data-test=registration-number-label]'));
    expect(registrationNumLabel).toBeTruthy();
    expect(registrationNumLabel.nativeElement.textContent).toEqual('TEAM_VIEW.REGISTRATION_NUMBER');

    // isActive Field
    const isActiveField = fixture.debugElement.query(By.css('[formControlName=isActive]'));
    expect(isActiveField).toBeTruthy();

    const isActiveFieldLabel = fixture.debugElement.query(By.css('[data-test=is_active_label]'));
    expect(isActiveFieldLabel).toBeTruthy();
    expect(isActiveFieldLabel.nativeElement.textContent).toEqual('TEAM_VIEW.ACTIVE');
  });

  it('login validator should work correctly', () => {
    const control = component.addUserForm.get('login');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    control.setValue(
      `login_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very
      _very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Maxlength)).toBe(true);

    control.setValue('lo');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Minlength)).toBe(true);

    control.setValue(' login ');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.NotTrimmed)).toBe(true);

    control.setValue('login with some spaces');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.WhiteSpaces)).toBe(true);
  });
  it('email validator should work correctly', () => {
    const control = component.addUserForm.get('email');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    control.setValue(
      `login_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very
      _very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Maxlength)).toBe(true);

    control.setValue('email@emil.e');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.EmailNotValid)).toBe(true);

    control.setValue('valid.email@imbus.tn');
    expect(control.valid).toEqual(true);
  });

  it('password validator should work correctly', () => {
    const control = component.addUserForm.get('password');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    control.setValue(
      `password_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very
      _very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Maxlength)).toBe(true);

    control.setValue('passw');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Minlength)).toBe(true);
  });

  it('password confirmed validator should work correctly', () => {
    const control = component.addUserForm.get('confirmPassword');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    control.setValue(
      `password_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very
      _very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Maxlength)).toBe(true);

    control.setValue('passw');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Minlength)).toBe(true);
  });
});
