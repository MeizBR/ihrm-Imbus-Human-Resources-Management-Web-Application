import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { reducers } from '../../core/reducers';

import { LoginComponent } from './login.component';
import { AngularMaterialModule } from '../../shared/angular-material/angular-material.module';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularMaterialModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        TranslateModule.forRoot(),
      ],
      declarations: [LoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.showPassword = false;
    component.errorMessage = '';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // FIXME: need to be adjusted with new design
  it('should display the view correctly', () => {
    const loginContainer = fixture.debugElement.query(By.css('.login-container'));
    expect(loginContainer).toBeTruthy();

    const loginCardContent = fixture.debugElement.query(By.css('.login-container mat-card mat-card-content'));
    expect(loginCardContent).toBeTruthy();
    expect(loginCardContent.nativeElement.childElementCount).toEqual(2);

    const loginCardTitle = fixture.debugElement.query(By.css('.login-container mat-card mat-card-content .title span'));
    expect(loginCardTitle).toBeTruthy();
    expect(loginCardTitle.nativeElement.textContent).toEqual('LOG_VIEW.IHRMLOG_VIEW.HR_MANAGEMENT');

    const loginCardForm = fixture.debugElement.query(By.css('.login-container mat-card mat-card-content .form-content'));
    expect(loginCardForm).toBeTruthy();

    const formTitle = fixture.debugElement.query(By.css('.form-content span'));
    expect(formTitle).toBeTruthy();
    expect(formTitle.nativeElement.textContent).toEqual('LOG_VIEW.LOG_IN');

    const form = fixture.debugElement.query(By.css('.form-content form'));
    expect(form).toBeTruthy();
    expect(form.nativeElement.childElementCount).toEqual(2);

    const formFields = fixture.debugElement.query(By.css('.form-content form .form-fields'));
    expect(formFields).toBeTruthy();
    expect(formFields.nativeElement.childElementCount).toEqual(3);

    const workspaceField = fixture.debugElement.query(By.css('[formControlName=workspace]'));
    expect(workspaceField.attributes.placeholder).toEqual('LOG_VIEW.WORKSPACE');

    const loginField = fixture.debugElement.query(By.css('[formControlName=login]'));
    expect(loginField.attributes.placeholder).toEqual('LOG_VIEW.LOGIN');

    let passwordField = fixture.debugElement.query(By.css('[formControlName=password]'));
    expect(passwordField.attributes.placeholder).toEqual('LOG_VIEW.PASSWORD');
    expect(passwordField.attributes.type).toEqual('password');

    component.showPassword = true;
    fixture.detectChanges();

    passwordField = fixture.debugElement.query(By.css('[formControlName=password]'));
    expect(passwordField.attributes.type).toEqual('text');

    let eyeIcon = fixture.debugElement.query(By.css('.password mat-icon'));
    expect(eyeIcon).toBeFalsy();

    passwordField.nativeElement.value = 'pass';
    passwordField.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    eyeIcon = fixture.debugElement.query(By.css('.password mat-icon'));
    expect(eyeIcon).toBeTruthy();
    expect(eyeIcon.nativeElement.textContent).toEqual('visibility_off');

    eyeIcon.nativeElement.click();
    fixture.detectChanges();

    expect(component.showPassword).toEqual(false);
    eyeIcon = fixture.debugElement.query(By.css('.password mat-icon'));
    expect(eyeIcon.nativeElement.textContent).toEqual('visibility');

    const actionsContainer = fixture.debugElement.query(By.css('.actions-container'));
    expect(actionsContainer).toBeTruthy();
  });

  it('should handle form actions correctly', () => {
    const spyOnLogin = spyOn(component, 'login').and.callThrough();
    const workspaceField = fixture.debugElement.query(By.css('[formControlName=workspace]'));
    const loginField = fixture.debugElement.query(By.css('[formControlName=login]'));
    const passwordField = fixture.debugElement.query(By.css('[formControlName=password]'));
    const loginButton = fixture.debugElement.query(By.css('.actions-container button'));
    expect(loginButton).toBeTruthy();
    expect(loginButton.nativeElement.textContent).toEqual(' LOG_VIEW.LOG_IN ');

    workspaceField.nativeElement.value = 'imbus';
    workspaceField.nativeElement.dispatchEvent(new Event('input'));

    loginField.nativeElement.value = 'login';
    loginField.nativeElement.dispatchEvent(new Event('input'));

    passwordField.nativeElement.value = 'pass';
    passwordField.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.loginForm.valid).toEqual(true);
    expect(loginButton.attributes.disabled).toBeFalsy();

    loginButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnLogin).toHaveBeenCalled();
  });
});
