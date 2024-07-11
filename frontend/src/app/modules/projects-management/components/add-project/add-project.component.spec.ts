import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { QuillModule } from 'ngx-quill';

import { AddProjectComponent } from './add-project.component';

import { ErrorType, trimmedValidator } from '../../../../shared/validators/index';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AddProjectComponent', () => {
  let component: AddProjectComponent;
  let fixture: ComponentFixture<AddProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [QuillModule.forRoot(), AngularMaterialModule, BrowserAnimationsModule, TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
      declarations: [AddProjectComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProjectComponent);
    component = fixture.componentInstance;
    component.addProjectForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
      customer: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      isActive: new FormControl(false),
    });
    component.formVisibility = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display element correctly', () => {
    component.formVisibility = false;
    fixture.detectChanges();

    let addButton = fixture.debugElement.query(By.css('.button-container'));
    let formContainer = fixture.debugElement.query(By.css('.add-project'));

    expect(addButton).toBeTruthy();
    expect(formContainer).toBeFalsy();

    component.formVisibility = true;
    fixture.detectChanges();

    addButton = fixture.debugElement.query(By.css('.button-container'));
    formContainer = fixture.debugElement.query(By.css('.add-project'));

    expect(addButton).toBeFalsy();
    expect(formContainer).toBeTruthy();
  });

  it('should display the add project form inputs correctly', () => {
    component.formVisibility = true;
    fixture.detectChanges();

    // name Field
    const nameField = fixture.debugElement.query(By.css('[formControlName=name]'));
    expect(nameField).toBeTruthy();

    const nameLabel = fixture.debugElement.query(By.css('[data-test=name_label]'));
    expect(nameLabel).toBeTruthy();
    expect(nameLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.PROJECT_NAME');

    // customer Field
    const customerLabel = fixture.debugElement.query(By.css('[data-test=customer-label]'));
    expect(customerLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.CUSTOMER_NAME');
    expect(customerLabel).toBeTruthy();

    const customerField = fixture.debugElement.query(By.css('[formControlName=customerId]'));
    expect(customerField).toBeTruthy();

    // description Field
    const descriptionField = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionField).toBeTruthy();

    const descriptionLabel = fixture.debugElement.query(By.css('[data-test=description-label]'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.DESCRIPTION:');

    // isActive Field
    const isActiveField = fixture.debugElement.query(By.css('[formControlName=isActive]'));
    expect(isActiveField).toBeTruthy();

    const isActiveFieldLabel = fixture.debugElement.query(By.css('[data-test=is_active_label]'));
    expect(isActiveFieldLabel).toBeTruthy();
    expect(isActiveFieldLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.ACTIVE');
  });

  it('name validator should work correctly', () => {
    const control = component.addProjectForm.get('name');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    control.setValue(
      `isName_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_
      very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Maxlength)).toBe(true);

    control.setValue('na');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Minlength)).toBe(true);

    control.setValue(' name ');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.NotTrimmed)).toBe(true);
  });

  it('action buttons should work correctly', () => {
    component.formVisibility = true;
    component.addProjectForm.controls['name'].setValue('Project A1');
    component.addProjectForm.controls['customerId'].setValue('1');
    fixture.detectChanges();

    const buttonsContainer = fixture.debugElement.query(By.css('.buttons-container'));
    const submitButton = fixture.debugElement.query(By.css('.submit-button'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit');
    const spyOnClose = spyOn(component, 'close');

    expect(buttonsContainer).toBeTruthy();
    expect(submitButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();

    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();

    cancelButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnClose).toHaveBeenCalled();
  });
});
