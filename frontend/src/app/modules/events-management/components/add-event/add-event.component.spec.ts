import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import * as moment from 'moment';

import { QuillModule } from 'ngx-quill';

import { TranslateModule } from '@ngx-translate/core';

import { AddEventComponent } from './add-event.component';

import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { CalendarDetails, EventToAdd } from '../../../../shared/models/index';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { dateValidator, trimmedValidator } from '../../../../shared/validators/custom-validators';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AddEventComponent', () => {
  let component: AddEventComponent;
  let fixture: ComponentFixture<AddEventComponent>;
  let selectItem: MatSelect;
  let elements: MatOption[];
  let selectedCol = [];
  let allDayCheckBox: MatCheckbox;

  const eventForm: FormGroup = new FormGroup(
    {
      id: new FormControl(null),
      calendarId: new FormControl(null, Validators.required),
      start: new FormControl('', Validators.required),
      end: new FormControl('', Validators.required),
      title: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
      description: new FormControl(''),
      repetition: new FormControl(Repetitive.Unrepeatable),
      allDay: new FormControl(true, Validators.required),
      eventType: new FormControl(EventType.Meeting, Validators.required),
    },
    { validators: dateValidator },
  );

  const calendarA: CalendarDetails = {
    id: 1,
    project: 1,
    projectName: 'Projet A1',
    name: 'Calendar N° 1',
    description: 'Description',
    isPrivate: false,
    userId: 1,
    timeZone: 'Africa/Tunis',
  };
  const calendarB: CalendarDetails = {
    id: 2,
    project: 2,
    projectName: 'Projet B1',
    name: 'Calendar N° 2',
    description: 'Description',
    isPrivate: false,
    userId: 2,
    timeZone: 'Africa/Tunis',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddEventComponent],
      imports: [AngularMaterialModule, BrowserAnimationsModule, TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, QuillModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEventComponent);
    component = fixture.componentInstance;
    component.form = eventForm;
    component.checked = true;
    component.calendarList = [calendarA, calendarB];
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
    let formContainer = fixture.debugElement.query(By.css('.add-event'));
    expect(addButton).toBeTruthy();
    expect(formContainer).toBeFalsy();

    component.formVisibility = true;
    fixture.detectChanges();

    addButton = fixture.debugElement.query(By.css('.button-container'));
    formContainer = fixture.debugElement.query(By.css('.add-event'));

    expect(addButton).toBeFalsy();
    expect(formContainer).toBeTruthy();
  });

  it('should display the add event form inputs correctly', () => {
    component.formVisibility = true;
    fixture.detectChanges();
    selectedCol = [];
    selectItem = fixture.debugElement.query(By.css('[formControlName=calendarId]')).componentInstance;
    expect(selectItem).toBeTruthy();
    elements = selectItem.options.toArray();

    selectItem.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[1]._selectViaInteraction();
    elements[0]._selectViaInteraction();

    expect(selectedCol).toEqual([2, 1]);

    // Title Field
    const titleField = fixture.debugElement.query(By.css('[formControlName=title]'));
    expect(titleField).toBeTruthy();
    expect(titleField.attributes.placeholder).toEqual('EVENTS_VIEW.TITLE');

    // Event type Field
    selectedCol = [];
    selectItem = fixture.debugElement.query(By.css('[formControlName=eventType]')).componentInstance;
    expect(selectItem).toBeTruthy();
    elements = selectItem.options.toArray();

    selectItem.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[3]._selectViaInteraction();
    elements[0]._selectViaInteraction();
    elements[2]._selectViaInteraction();
    elements[1]._selectViaInteraction();

    expect(selectedCol).toEqual(['Leave', 'Meeting', 'Training', 'Workshop']);

    // Repetition Field
    selectedCol = [];
    selectItem = fixture.debugElement.query(By.css('[formControlName=repetition]')).componentInstance;
    expect(selectItem).toBeTruthy();
    elements = selectItem.options.toArray();

    selectItem.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[3]._selectViaInteraction();
    elements[0]._selectViaInteraction();
    elements[2]._selectViaInteraction();
    elements[4]._selectViaInteraction();
    elements[1]._selectViaInteraction();

    expect(selectedCol).toEqual(['Yearly', 'Daily', 'Monthly', 'Unrepeatable', 'Weekly']);

    // All Day Field
    allDayCheckBox = fixture.debugElement.query(By.css('[formControlName=allDay]')).componentInstance;
    expect(allDayCheckBox).toBeTruthy();

    // Start date div
    const startDateDivision = fixture.debugElement.query(By.css('.start-date-field'));
    expect(startDateDivision).toBeTruthy();

    // End date div
    const endDateDivision = fixture.debugElement.query(By.css('.end-date-field'));
    expect(endDateDivision).toBeTruthy();

    // description Field
    const descriptionField = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionField).toBeTruthy();

    const descriptionLabel = fixture.debugElement.query(By.css('[data-test=description-label]'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.DESCRIPTION:');
  });

  it('should display the date divisions correctly', () => {
    component.formVisibility = true;
    fixture.detectChanges();

    // Start date div
    let startDateDivision = fixture.debugElement.query(By.css('.start-date-field'));
    expect(startDateDivision).toBeTruthy();
    expect(startDateDivision.nativeElement.childElementCount).toEqual(1);
    expect(startDateDivision.children[0].name).toEqual('app-datepicker');

    // End date div
    let endDateDivision = fixture.debugElement.query(By.css('.end-date-field'));

    expect(endDateDivision).toBeTruthy();
    expect(endDateDivision.nativeElement.childElementCount).toEqual(1);
    expect(endDateDivision.children[0].name).toEqual('app-datepicker');

    component.checked = false;
    fixture.detectChanges();

    // Start date div
    startDateDivision = fixture.debugElement.query(By.css('.start-date-field'));
    expect(startDateDivision).toBeTruthy();
    expect(startDateDivision.nativeElement.childElementCount).toEqual(1);
    expect(startDateDivision.children[0].name).toEqual('app-datetimepicker');

    // End date div
    endDateDivision = fixture.debugElement.query(By.css('.end-date-field'));
    expect(endDateDivision).toBeTruthy();
    expect(endDateDivision.nativeElement.childElementCount).toEqual(1);
    expect(endDateDivision.children[0].name).toEqual('app-datetimepicker');
  });

  it('title validator should work correctly', () => {
    const control = component.form.get('title');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    control.setValue(
      `isTitle_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_
      very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Maxlength)).toBe(true);

    control.setValue('ti');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Minlength)).toBe(true);

    control.setValue(' title ');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.NotTrimmed)).toBe(true);
  });

  it('action buttons should work correctly', () => {
    component.formVisibility = true;
    eventForm.controls['calendarId'].setValue(1);
    eventForm.controls['allDay'].setValue(false);
    eventForm.controls['start'].setValue(moment([2021, 11, 5, 9, 0]));
    eventForm.controls['end'].setValue(moment([2021, 11, 5, 9, 30]));
    eventForm.controls['title'].setValue('First Event');
    eventForm.controls['eventType'].setValue('Meeting');

    component.form = eventForm;
    fixture.detectChanges();

    const buttonsContainer = fixture.debugElement.query(By.css('.buttons-container'));
    const submitButton = fixture.debugElement.query(By.css('.add-button'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit').and.callThrough();
    const spyOnClose = spyOn(component, 'onClose').and.callThrough();
    const spyOnSubmitItem = spyOn(component.onSubmitItem, 'emit').and.callThrough();

    expect(buttonsContainer).toBeTruthy();
    expect(submitButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();
    expect(component.form.valid).toEqual(true);
    const eventToAdd: EventToAdd = {
      calendarId: component.form.value.calendarId,
      start: new Date(component.form.controls['start'].value),
      end: new Date(component.form.controls['end'].value),
      title: component.form.value.title,
      description: component.form.value.description,
      repetition: component.form.value.repetition,
      allDay: component.form.value.allDay,
      eventType: component.form.value.eventType,
    };
    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();
    expect(spyOnSubmitItem).toHaveBeenCalledWith(eventToAdd);

    cancelButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnClose).toHaveBeenCalled();
    expect(component.form.valid).toEqual(false);
  });
});
