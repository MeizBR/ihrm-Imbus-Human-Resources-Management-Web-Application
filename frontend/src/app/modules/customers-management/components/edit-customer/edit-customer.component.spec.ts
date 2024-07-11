import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { QuillModule } from 'ngx-quill';

import { EditCustomerComponent } from './edit-customer.component';

import { ErrorType, trimmedValidator } from '../../../../shared/validators/index';
import { CustomerDetailedPermissions } from '../../../../shared/models/customer-models/customerDetails';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('EditCustomerComponent', () => {
  let component: EditCustomerComponent;
  let fixture: ComponentFixture<EditCustomerComponent>;
  const editCustomerDetails: CustomerDetailedPermissions = {
    id: 1,
    name: 'Customer N°1',
    description: 'Description of Customer N°1',
    isActive: true,
    userPermissions: {
      canEdit: true,
      seeRoles: true,
      canDelete: true,
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCustomerComponent],
      imports: [AngularMaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), QuillModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCustomerComponent);
    component = fixture.componentInstance;
    component.editCustomerDetails = editCustomerDetails;
    component.form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
      description: new FormControl(''),
      isActive: new FormControl(false),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the header card correctly', () => {
    const customerDetailsCard = fixture.debugElement.query(By.css('.customer-details-card'));
    const cardHeaderText = fixture.debugElement.query(By.css('.customer-details-card .card-header-text'));
    const cardTitle = fixture.debugElement.query(By.css('.customer-details-card .card-header-text .card-title'));
    expect(customerDetailsCard).toBeTruthy();
    expect(cardHeaderText).toBeTruthy();
    expect(cardTitle).toBeTruthy();
    expect(cardTitle.nativeElement.textContent).toEqual('CUSTOMERS_VIEW.EDIT_CUSTOMER.CUSTOMER_DETAILS');
  });

  it('should display the edit card content data correctly', () => {
    const customerCardContent = fixture.debugElement.query(By.css('.customer-details-card .card-content'));
    expect(customerCardContent).toBeTruthy();

    expect(customerCardContent.nativeElement.childElementCount).toEqual(1);

    const editCustomerForm = fixture.debugElement.query(By.css('.customer-details-card .card-content form'));
    expect(editCustomerForm).toBeTruthy();
    expect(editCustomerForm.nativeElement.childElementCount).toEqual(2);

    const sectionContainer = fixture.debugElement.query(By.css('.customer-details-card .card-content form .section-container'));
    expect(sectionContainer).toBeTruthy();
    expect(sectionContainer.nativeElement.childElementCount).toEqual(2);

    const nameContainer = fixture.debugElement.query(By.css('.section-container .name-container'));
    expect(nameContainer).toBeTruthy();

    const nameField = fixture.debugElement.query(By.css('.section-container .name-container mat-form-field'));
    expect(nameField).toBeTruthy();

    const nameFieldLabel = fixture.debugElement.query(By.css('[data-test=name_label]'));
    expect(nameFieldLabel).toBeTruthy();
    expect(nameFieldLabel.nativeElement.textContent).toEqual('CUSTOMERS_VIEW.NAME');

    const nameFieldInput = fixture.debugElement.query(By.css('[formControlName=name]'));
    expect(nameFieldInput).toBeTruthy();

    const nameFieldCounterHint = fixture.debugElement.query(By.css('.section-container .name-container mat-form-field .counter'));
    expect(nameFieldCounterHint).toBeTruthy();

    const isActiveContainer = fixture.debugElement.query(By.css('.section-container .is-active-section'));
    expect(isActiveContainer).toBeTruthy();
    expect(isActiveContainer.nativeElement.childElementCount).toEqual(2);

    const isActiveLabel = fixture.debugElement.query(By.css('[data-test=is-active-label]'));
    expect(isActiveLabel).toBeTruthy();
    expect(isActiveLabel.nativeElement.textContent).toEqual('CUSTOMERS_VIEW.ACTIVE');

    const isActiveSlideToggle = fixture.debugElement.query(By.css('[formControlName=isActive]'));
    expect(isActiveSlideToggle).toBeTruthy();

    const descriptionSection = fixture.debugElement.query(By.css('.customer-details-card .card-content form .description-section'));
    expect(descriptionSection).toBeTruthy();
    expect(descriptionSection.nativeElement.childElementCount).toEqual(2);

    const descriptionLabel = fixture.debugElement.query(By.css('[data-test=description-label]'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('CUSTOMERS_VIEW.DESCRIPTION:');

    const descriptionRichText = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionRichText).toBeTruthy();

    const buttonsContainer = fixture.debugElement.query(By.css('.customer-details-card .card-content .buttons-container'));
    expect(buttonsContainer).toBeTruthy();
    expect(buttonsContainer.nativeElement.childElementCount).toEqual(2);

    const saveButton = fixture.debugElement.query(By.css('.buttons-container .save-button'));
    expect(saveButton).toBeTruthy();
    expect(saveButton.nativeElement.textContent).toEqual(' SAVE ');

    const cancelButton = fixture.debugElement.query(By.css('.buttons-container .cancel-button'));
    expect(cancelButton).toBeTruthy();
    expect(cancelButton.nativeElement.textContent).toEqual(' CANCEL ');
  });

  it('validator should work correctly', () => {
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

    control.setValue(' Customer N°1 ');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.NotTrimmed)).toBe(true);
    expect(ErrorType.getErrorMessage(control.errors)).toEqual('Leading or trailing white spaces are not allowed.');
  });

  it('should update the customer details related to form data', () => {
    const nameInput = fixture.debugElement.query(By.css('[formControlName=name]'));
    const descriptionInput = fixture.debugElement.query(By.css('[formControlName=description]'));
    const saveButton = fixture.debugElement.query(By.css('button[type=submit]'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit').and.callThrough();
    const spyOnUpdatedCustomer = spyOn(component.updateCustomer, 'emit').and.callThrough();
    const spyOnCancelEdit = spyOn(component, 'onCancelEdit').and.callThrough();

    component.ngOnChanges({ editCustomerDetails: new SimpleChange(editCustomerDetails, undefined, true) });
    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.dirty).toEqual(false);
    expect(component.form.controls['name'].value).toEqual('Customer N°1');
    expect(component.form.controls['description'].value).toEqual('Description of Customer N°1');
    expect(component.form.controls['isActive'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeTruthy();
    expect(cancelButton.properties.disabled).toBeTruthy();

    nameInput.nativeElement.value = 'Customer N°2';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    nameInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.patchValue({ name: 'Customer N°2' });

    descriptionInput.nativeElement.value = 'Description of Customer N°2';
    descriptionInput.nativeElement.dispatchEvent(new Event('change'));
    descriptionInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.patchValue({ description: 'Description of Customer N°2' });
    component.form.markAsDirty();

    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.controls['name'].value).toEqual('Customer N°2');
    expect(component.form.controls['description'].value).toEqual('Description of Customer N°2');
    expect(component.form.controls['isActive'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeFalsy();
    expect(cancelButton.properties.disabled).toBeFalsy();

    saveButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();
    expect(component.form.valid).toEqual(true);
    expect(spyOnUpdatedCustomer).toHaveBeenCalled();

    cancelButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnCancelEdit).toHaveBeenCalled();
    expect(component.form.controls['name'].value).toEqual('Customer N°1');
    expect(component.form.controls['description'].value).toEqual('Description of Customer N°1');
    expect(component.form.controls['isActive'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeTruthy();
    expect(cancelButton.properties.disabled).toBeTruthy();
  });
});
