import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { QuillModule } from 'ngx-quill';

import { AddCalendarComponent } from './add-calendar.component';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { trimmedValidator } from '../../../../shared/validators/custom-validators';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AddCalendarComponent', () => {
  let component: AddCalendarComponent;
  let fixture: ComponentFixture<AddCalendarComponent>;
  const newForm: FormGroup = new FormGroup({
    id: new FormControl(null),
    projectId: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
    description: new FormControl(''),
    isPublic: new FormControl(''),
    timeZone: new FormControl(''),
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), QuillModule.forRoot()],
      declarations: [AddCalendarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCalendarComponent);
    component = fixture.componentInstance;
    component.addCalendarForm = newForm;
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
    let formContainer = fixture.debugElement.query(By.css('.add-calendar'));

    expect(addButton).toBeTruthy();
    expect(formContainer).toBeFalsy();

    component.formVisibility = true;
    fixture.detectChanges();

    addButton = fixture.debugElement.query(By.css('.button-container'));
    formContainer = fixture.debugElement.query(By.css('.add-calendar'));

    expect(addButton).toBeFalsy();
    expect(formContainer).toBeTruthy();
  });

  it('should display the add calendar form inputs correctly', () => {
    component.formVisibility = true;
    fixture.detectChanges();

    // project Field
    const projectField = fixture.debugElement.query(By.css('[formControlName=projectId]'));
    expect(projectField).toBeTruthy();

    const projectLabel = fixture.debugElement.query(By.css('[data-test=project_label]'));
    expect(projectLabel).toBeTruthy();
    expect(projectLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.NO_AVAILABLE_PROJECTS');

    component.projectsList = [
      {
        id: 1,
        customerId: 1,
        customer: 'Customer N°1',
        name: 'Project A1',
        description: '',
        isActive: true,
        userRoles: [],
      },
    ];
    fixture.detectChanges();
    expect(projectLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.ADD_CALENDAR_FORM.PROJECT_NAME');

    // name Field
    const nameField = fixture.debugElement.query(By.css('[formControlName=name]'));
    expect(nameField).toBeTruthy();

    const nameLabel = fixture.debugElement.query(By.css('[data-test=name_label]'));
    expect(nameLabel).toBeTruthy();
    expect(nameLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.ADD_CALENDAR_FORM.NAME');

    // time zone Field
    const timeZoneField = fixture.debugElement.query(By.css('[formControlName=timeZone]'));
    expect(timeZoneField).toBeTruthy();

    const timeZoneLabel = fixture.debugElement.query(By.css('[data-test=time_zone_label]'));
    expect(timeZoneLabel).toBeTruthy();
    expect(timeZoneLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.ADD_CALENDAR_FORM.TIME_ZONE');

    // isPublic Field
    const isPublicField = fixture.debugElement.query(By.css('[formControlName=isPublic]'));
    expect(isPublicField).toBeTruthy();

    const isPublicFieldLabel = fixture.debugElement.query(By.css('[data-test=public_label]'));
    expect(isPublicFieldLabel).toBeTruthy();
    expect(isPublicFieldLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.ADD_CALENDAR_FORM.IS_PUBLIC');

    // description Field
    const descriptionField = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionField).toBeTruthy();

    const descriptionLabel = fixture.debugElement.query(By.css('[data-test=description-label]'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.ADD_CALENDAR_FORM.DESCRIPTION:');
  });

  it('name validator should work correctly', () => {
    const control = component.addCalendarForm.get('name');

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
    component.addCalendarForm.controls['name'].setValue('Calendar N°1');
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
