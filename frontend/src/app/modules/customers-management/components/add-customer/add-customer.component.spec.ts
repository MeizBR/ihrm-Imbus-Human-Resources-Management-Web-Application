import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { QuillModule } from 'ngx-quill';

import { AddCustomerComponent } from './add-customer.component';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AddCustomerComponent', () => {
  let component: AddCustomerComponent;
  let fixture: ComponentFixture<AddCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddCustomerComponent],
      imports: [AngularMaterialModule, BrowserAnimationsModule, QuillModule.forRoot(), TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display element correctly', () => {
    component.formVisibility = false;
    fixture.detectChanges();

    const addCustomerContainer = fixture.debugElement.query(By.css('.add-customer-container'));
    let addCustomerButton = fixture.debugElement.query(By.css('.button-container'));
    let customerFormContainer = fixture.debugElement.query(By.css('.add-customer'));

    expect(addCustomerContainer).toBeTruthy();
    expect(addCustomerButton).toBeTruthy();
    expect(customerFormContainer).toBeFalsy();

    component.formVisibility = true;
    fixture.detectChanges();

    addCustomerButton = fixture.debugElement.query(By.css('.button-container'));
    customerFormContainer = fixture.debugElement.query(By.css('.add-customer'));

    expect(addCustomerButton).toBeFalsy();
    expect(customerFormContainer).toBeTruthy();
  });

  it('should display the inputs of add customer form correctly', () => {
    component.formVisibility = true;
    fixture.detectChanges();

    // name Field
    const nameField = fixture.debugElement.query(By.css('[formControlName=name]'));
    expect(nameField).toBeTruthy();

    const nameLabel = fixture.debugElement.query(By.css('[data-test=name-label]'));
    expect(nameLabel).toBeTruthy();
    expect(nameLabel.nativeElement.textContent).toEqual('CUSTOMERS_VIEW.NAME');

    // description Field
    const descriptionField = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionField).toBeTruthy();

    const descriptionLabel = fixture.debugElement.query(By.css('[data-test=description-label]'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('CUSTOMERS_VIEW.DESCRIPTION:');

    // isActive Field
    const isActiveField = fixture.debugElement.query(By.css('[formControlName=isActive]'));
    expect(isActiveField).toBeTruthy();

    const isActiveFieldLabel = fixture.debugElement.query(By.css('[data-test=is-active-label]'));
    expect(isActiveFieldLabel).toBeTruthy();
    expect(isActiveFieldLabel.nativeElement.textContent).toEqual('CUSTOMERS_VIEW.ACTIVE');
  });

  it('name validator should work correctly', () => {
    const control = component.form.get('name');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    control.setValue(
      `isName_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_
      very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Maxlength)).toBe(true);
    expect(control.errors[ErrorType.Maxlength].requiredLength).toEqual(255);
    expect(ErrorType.getErrorMessage(control.errors, 'Name')).toEqual('Name is too long, max of 255 characters are allowed.');

    control.setValue('na');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Minlength)).toBe(true);
    expect(control.errors[ErrorType.Minlength].requiredLength).toEqual(3);
    expect(ErrorType.getErrorMessage(control.errors, 'Name')).toEqual('Minimum of 3 characters are required.');

    control.setValue(' name ');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.NotTrimmed)).toBe(true);
    expect(ErrorType.getErrorMessage(control.errors)).toEqual('Leading or trailing white spaces are not allowed.');
  });

  it('action buttons should work correctly', () => {
    component.formVisibility = true;
    component.form.controls['name'].setValue('Customer N°1');
    fixture.detectChanges();

    const buttonsContainer = fixture.debugElement.query(By.css('.buttons-container'));
    const submitButton = fixture.debugElement.query(By.css('.submit-button'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit');
    const spyOnClear = spyOn(component, 'onClear');

    expect(buttonsContainer).toBeTruthy();
    expect(submitButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();

    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();

    cancelButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnClear).toHaveBeenCalled();
  });
});
