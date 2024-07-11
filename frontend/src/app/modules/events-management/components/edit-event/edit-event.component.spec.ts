import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { QuillModule } from 'ngx-quill';

import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { reducers } from '../../../../core/reducers';

import { EditEventComponent } from './edit-event.component';

import { EventDetails } from '../../../../shared/models';
import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { dateValidator, trimmedValidator } from '../../../../shared/validators/custom-validators';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('EditEventComponent', () => {
  let component: EditEventComponent;
  let fixture: ComponentFixture<EditEventComponent>;
  let calendarSelect: MatSelect;
  let eventTypeSelect: MatSelect;
  let repetitionSelect: MatSelect;
  let elements: MatOption[] = [];
  let selectedCol = [];
  let checked = true;

  const editEventDetails: EventDetails = {
    id: 1,
    calendarId: 1,
    isPrivateCalendar: false,
    start: new Date('2021-01-01'),
    end: new Date('2021-01-01'),
    title: 'First Event',
    description: 'Description for First Event',
    repetition: Repetitive.Monthly,
    allDay: true,
    creator: 2,
    eventType: EventType.Meeting,
  };

  const calendarA = {
    id: 1,
    project: 1,
    projectName: 'Projet A1',
    name: 'Calendar N° 1',
    description: 'Description',
    isPrivate: false,
    userId: 1,
    timeZone: 'Africa/Tunis',
  };
  const calendarB = {
    id: 2,
    project: 2,
    projectName: 'Projet B1',
    name: 'Calendar N° 2',
    description: 'Description',
    isPrivate: true,
    userId: 2,
    timeZone: 'Africa/Tunis',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditEventComponent],
      imports: [
        AngularMaterialModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        TranslateModule.forRoot(),
        RouterTestingModule,
        QuillModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEventComponent);
    component = fixture.componentInstance;
    component.checked = checked;
    component.selectedCalendar = calendarA;
    component.editEventDetails = editEventDetails;
    component.calendarsList = [calendarA, calendarB];
    component.form = new FormGroup(
      {
        id: new FormControl(null),
        calendarId: new FormControl(null, Validators.required),
        start: new FormControl('', Validators.required),
        end: new FormControl('', Validators.required),
        title: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
        description: new FormControl(''),
        repetition: new FormControl(''),
        allDay: new FormControl(true, Validators.required),
        eventType: new FormControl(EventType.Meeting, Validators.required),
      },
      { validators: dateValidator },
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the header card correctly', () => {
    const eventDetailsCard = fixture.debugElement.query(By.css('.event-card'));
    const cardHeaderText = fixture.debugElement.query(By.css('.event-card .card-header-text'));
    const cardTitle = fixture.debugElement.query(By.css('.event-card .card-header-text .card-title'));
    expect(eventDetailsCard).toBeTruthy();
    expect(cardHeaderText).toBeTruthy();
    expect(cardTitle).toBeTruthy();
    expect(cardTitle.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.EVENT_DETAILS :');
  });

  it('should display the edit card content data correctly', () => {
    component.ngOnChanges({ editEventDetails: new SimpleChange(editEventDetails, undefined, true) });
    fixture.detectChanges();

    const eventCardContent = fixture.debugElement.query(By.css('.event-card .card-content'));
    expect(eventCardContent).toBeTruthy();

    const editEventForm = fixture.debugElement.query(By.css('form'));
    expect(editEventForm).toBeTruthy();
    expect(editEventForm.nativeElement.childElementCount).toEqual(3);

    const sectionContainer = fixture.debugElement.queryAll(By.css('.section-container'));
    expect(sectionContainer).toBeTruthy();
    expect(sectionContainer.length).toEqual(2);

    const detailsContainer = sectionContainer[0];
    expect(detailsContainer).toBeTruthy();
    expect(detailsContainer.nativeElement.childElementCount).toEqual(4);

    /** Calendar field */
    const calendarField = fixture.debugElement.query(By.css('.calendar-field'));
    expect(calendarField).toBeTruthy();

    const calendarFieldLabel = fixture.debugElement.query(By.css('[data-test=calendar_label]'));
    expect(calendarFieldLabel).toBeTruthy();
    expect(calendarFieldLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.CALENDAR_NAME');

    calendarSelect = fixture.debugElement.query(By.css('[formControlName=calendarId]')).componentInstance;
    expect(calendarSelect).toBeTruthy();
    expect(calendarSelect.triggerValue).toEqual('Calendar N° 1public');

    elements = calendarSelect.options.toArray();
    expect(elements.length).toBe(2);
    selectedCol = [];
    calendarSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[1]._selectViaInteraction();
    elements[0]._selectViaInteraction();

    expect(selectedCol.length).toBe(2);
    expect(selectedCol).toEqual([2, 1]);

    /** Title field */
    const titleField = fixture.debugElement.query(By.css('#title-field'));
    expect(titleField).toBeTruthy();

    const titleFieldLabel = fixture.debugElement.query(By.css('[data-test=title_label]'));
    expect(titleFieldLabel).toBeTruthy();
    expect(titleFieldLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.TITLE');

    const titleInput = fixture.debugElement.query(By.css('[formControlName=title]'));
    expect(titleInput).toBeTruthy();

    titleInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.controls['title'].setValue(' title ');
    fixture.detectChanges();

    const titleErrorHint = fixture.debugElement.query(By.css('#title-error-message'));

    expect(titleErrorHint).toBeTruthy();
    expect(titleErrorHint.nativeElement.innerText).toEqual('Leading or trailing white spaces are not allowed.');

    /** Event type field */
    const eventTypeField = fixture.debugElement.query(By.css('#event-type-field'));
    expect(eventTypeField).toBeTruthy();

    const eventTypeFieldLabel = fixture.debugElement.query(By.css('[data-test=event_type_label]'));
    expect(eventTypeFieldLabel).toBeTruthy();
    expect(eventTypeFieldLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.EVENT_TYPE');

    eventTypeSelect = fixture.debugElement.query(By.css('[formControlName=eventType]')).componentInstance;
    expect(eventTypeSelect).toBeTruthy();
    elements = eventTypeSelect.options.toArray();

    expect(elements.length).toBe(4);
    selectedCol = [];
    eventTypeSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[3]._selectViaInteraction();
    elements[0]._selectViaInteraction();
    elements[2]._selectViaInteraction();
    elements[1]._selectViaInteraction();

    expect(selectedCol).toEqual(['Leave', 'Meeting', 'Training', 'Workshop']);

    /** Repetition field */
    const repetitionField = fixture.debugElement.query(By.css('#repetition-field'));
    expect(repetitionField).toBeTruthy();

    const repetitionFieldLabel = fixture.debugElement.query(By.css('[data-test=repetition_label]'));
    expect(repetitionFieldLabel).toBeTruthy();
    expect(repetitionFieldLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.REPETITION');

    repetitionSelect = fixture.debugElement.query(By.css('[formControlName=repetition]')).componentInstance;
    expect(repetitionSelect).toBeTruthy();
    elements = repetitionSelect.options.toArray();
    expect(elements.length).toBe(5);
    selectedCol = [];
    repetitionSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[3]._selectViaInteraction();
    elements[0]._selectViaInteraction();
    elements[2]._selectViaInteraction();
    elements[4]._selectViaInteraction();
    elements[1]._selectViaInteraction();

    expect(selectedCol).toEqual(['Yearly', 'Daily', 'Monthly', 'Unrepeatable', 'Weekly']);

    const dateContainer = sectionContainer[1];
    expect(dateContainer).toBeTruthy();

    expect(dateContainer.nativeElement.childElementCount).toEqual(3);

    /** Start date div */
    const startDateDivision = fixture.debugElement.query(By.css('.start-date-field'));
    expect(startDateDivision).toBeTruthy();

    /** End date div */
    const endDateDivision = fixture.debugElement.query(By.css('.end-date-field'));
    expect(endDateDivision).toBeTruthy();

    /** All day field */
    const allDayField = fixture.debugElement.query(By.css('.all-day-check-box'));
    expect(allDayField).toBeTruthy();

    const allDayFieldLabel = fixture.debugElement.query(By.css('[data-test=all_day_label]'));
    expect(allDayFieldLabel).toBeTruthy();
    expect(allDayFieldLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.ALL_DAY');

    const allDaySlideToggle = fixture.debugElement.query(By.css('[formControlName=allDay]'));
    expect(allDaySlideToggle).toBeTruthy();

    /** Description container */
    const descriptionContainer = fixture.debugElement.query(By.css('.description-container'));
    expect(descriptionContainer).toBeTruthy();

    expect(descriptionContainer.nativeElement.childElementCount).toEqual(2);

    const descriptionLabel = fixture.debugElement.query(By.css('[data-test=description_label]'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.DESCRIPTION:');

    const descriptionRichText = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionRichText).toBeTruthy();

    /** Actions Container */
    const actionsContainer = fixture.debugElement.query(By.css('.actions-container'));
    expect(actionsContainer).toBeTruthy();

    expect(actionsContainer.nativeElement.childElementCount).toEqual(2);

    const saveButton = fixture.debugElement.query(By.css('[type=submit]'));
    expect(saveButton).toBeTruthy();
    expect(saveButton.nativeElement.textContent).toEqual('SAVE');

    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    expect(cancelButton).toBeTruthy();
    expect(cancelButton.nativeElement.textContent).toEqual('CANCEL');
  });

  it('should display the date divisions correctly', () => {
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

    checked = false;
    component.checked = checked;
    component.editEventDetails = { ...editEventDetails, allDay: false };
    component.ngOnChanges({ editEventDetails: new SimpleChange({ ...editEventDetails, allDay: false }, undefined, true) });

    fixture.detectChanges();
    // tick();

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

  it('date validator should work correctly', () => {
    const allDay = component.form.get('allDay');
    const startDate = component.form.get('start');
    const endDate = component.form.get('end');

    startDate.setValue('');
    endDate.setValue('');
    expect(endDate.valid).toEqual(false);
    expect(endDate.hasError(ErrorType.Required)).toBe(true);

    endDate.setValue('2021-12-11T22:00:00Z');
    expect(startDate.valid).toEqual(false);
    expect(startDate.hasError(ErrorType.MustSelectStartDate)).toBe(true);

    startDate.setValue('2021-12-12T23:00:00Z');
    expect(startDate.valid).toEqual(false);
    expect(startDate.hasError(ErrorType.LesserDate)).toBe(true);

    allDay.setValue(false);
    startDate.setValue('2021-12-11T22:00:00Z');
    expect(endDate.valid).toEqual(false);
    expect(endDate.hasError(ErrorType.SameDateTime)).toBe(true);

    endDate.setValue('');
    expect(endDate.valid).toEqual(false);
    expect(endDate.hasError(ErrorType.Required)).toBe(true);
  });

  it('should update the event details related to form data', () => {
    const editEventForm = fixture.debugElement.query(By.css('form'));
    calendarSelect = fixture.debugElement.query(By.css('[formControlName=calendarId]')).componentInstance;
    const titleField = fixture.debugElement.query(By.css('[formControlName=title]'));
    const descriptionField = fixture.debugElement.query(By.css('[formControlName=description]'));
    const saveButton = fixture.debugElement.query(By.css('button[type=submit]'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit').and.callThrough();
    const spyOnUpdatedEvent = spyOn(component.updateEvent, 'emit').and.callThrough();

    component.ngOnChanges({ editEventDetails: new SimpleChange(editEventDetails, undefined, true) });
    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.dirty).toEqual(false);
    expect(component.form.controls['calendarId'].value).toEqual(1);
    expect(component.form.controls['title'].value).toEqual('First Event');
    expect(component.form.controls['eventType'].value).toEqual(EventType.Meeting);
    expect(component.form.controls['repetition'].value).toEqual(Repetitive.Monthly);
    expect(component.form.controls['description'].value).toEqual('Description for First Event');
    expect(component.form.controls['allDay'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeTruthy();
    expect(cancelButton.properties.disabled).toBeTruthy();

    elements = calendarSelect.options.toArray();

    expect(elements.length).toBe(2);
    selectedCol = [];
    calendarSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[1]._selectViaInteraction();

    titleField.nativeElement.value = 'First Event updated';
    titleField.nativeElement.dispatchEvent(new Event('input'));
    titleField.nativeElement.dispatchEvent(new Event('blur'));
    component.form.patchValue({ title: 'First Event updated' });

    descriptionField.nativeElement.value = 'Description for First Event updated';
    descriptionField.nativeElement.dispatchEvent(new Event('change'));
    descriptionField.nativeElement.dispatchEvent(new Event('blur'));
    component.form.patchValue({ description: 'Description for First Event updated' });
    component.form.markAsDirty();

    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.dirty).toEqual(true);
    expect(component.form.controls['calendarId'].value).toEqual(2);
    expect(component.form.controls['title'].value).toEqual('First Event updated');
    expect(component.form.controls['eventType'].value).toEqual(EventType.Meeting);
    expect(component.form.controls['repetition'].value).toEqual(Repetitive.Monthly);
    expect(component.form.controls['description'].value).toEqual('Description for First Event updated');
    expect(component.form.controls['allDay'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeFalsy();
    expect(cancelButton.properties.disabled).toBeFalsy();

    editEventForm.triggerEventHandler('submit', null);
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();
    expect(component.form.valid).toEqual(true);
    expect(spyOnUpdatedEvent).toHaveBeenCalled();

    cancelButton.nativeElement.click();
    fixture.detectChanges();
  });
});
