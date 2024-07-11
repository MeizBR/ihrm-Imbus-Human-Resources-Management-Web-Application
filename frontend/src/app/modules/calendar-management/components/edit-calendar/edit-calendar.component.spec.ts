import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { QuillModule } from 'ngx-quill';

import { TranslateModule } from '@ngx-translate/core';

import { EditCalendarComponent } from './edit-calendar.component';

import { CalendarDetails, ProjectDetails } from '../../../../shared/models/index';
import { ErrorType, trimmedValidator } from '../../../../shared/validators/index';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('EditCalendarComponent', () => {
  let component: EditCalendarComponent;
  let fixture: ComponentFixture<EditCalendarComponent>;
  let projectSelect: MatSelect;
  let timeZoneSelect: MatSelect;
  let elements: MatOption[] = [];
  let selectedCol = [];
  const editCalendarDetails: CalendarDetails = {
    id: 1,
    project: 1,
    projectName: 'Project A1',
    name: 'Calendar N°1',
    description: 'Description',
    isPrivate: false,
    userId: 1,
    timeZone: 'Pacific/Kiritimati',
    userPermission: {
      canEdit: true,
      canUpdateVisibility: false,
    },
  };
  const projectsList: ProjectDetails[] = [
    {
      id: 1,
      customerId: 1,
      customer: 'Customer N°1',
      name: 'Project A1',
      description: 'Description',
      isActive: true,
      userRoles: [],
    },
    {
      id: 2,
      customerId: 2,
      customer: 'Customer N°21',
      name: 'Project 2',
      description: 'Description',
      isActive: true,
      userRoles: [],
    },
  ];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCalendarComponent],
      imports: [AngularMaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), QuillModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCalendarComponent);
    component = fixture.componentInstance;
    component.editCalendarDetails = editCalendarDetails;
    component.projectsList = projectsList;
    component.TIMEZONES = [
      { group: 'UTC+14:00', timezone: 'Pacific/Kiritimati', label: 'Pacific/Kiritimati (+14)' },
      { group: 'UTC+13:00', timezone: 'Pacific/Apia', label: 'Pacific/Apia (+13)' },
      { group: 'UTC+13:00', timezone: 'Pacific/Enderbury', label: 'Pacific/Enderbury (+13)' },
      { group: 'UTC+13:00', timezone: 'Pacific/Fakaofo', label: 'Pacific/Fakaofo (+13)' },
      { group: 'UTC+13:00', timezone: 'Pacific/Tongatapu', label: 'Pacific/Tongatapu (+13)' },
    ];
    component.form = new FormGroup({
      id: new FormControl(null),
      projectId: new FormControl(''),
      name: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
      description: new FormControl(''),
      isPublic: new FormControl(''),
      timeZone: new FormControl(''),
    });
    component.isOwner = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the header card correctly', () => {
    const calendarDetailsCard = fixture.debugElement.query(By.css('.calendar-card'));
    const cardHeaderText = fixture.debugElement.query(By.css('.calendar-card .card-header-text'));
    const cardTitle = fixture.debugElement.query(By.css('.calendar-card .card-header-text .card-title'));
    expect(calendarDetailsCard).toBeTruthy();
    expect(cardHeaderText).toBeTruthy();
    expect(cardTitle).toBeTruthy();
    expect(cardTitle.nativeElement.textContent).toEqual('CALENDAR_VIEW.EDIT_CALENDAR.CALENDAR_DETAILS :');
  });

  it('should display the edit card content data correctly', () => {
    component.ngOnChanges({
      editCalendarDetails: new SimpleChange(editCalendarDetails, undefined, false),
    });

    const calendarCardContent = fixture.debugElement.query(By.css('.calendar-card .card-content'));
    expect(calendarCardContent).toBeTruthy();

    const editCalendarForm = fixture.debugElement.query(By.css('form'));
    expect(editCalendarForm).toBeTruthy();
    expect(editCalendarForm.nativeElement.childElementCount).toEqual(2);

    const editCalendarData = fixture.debugElement.query(By.css('.calendar-data'));
    expect(editCalendarData).toBeTruthy();
    expect(editCalendarData.nativeElement.childElementCount).toEqual(2);

    const detailsInputRow = fixture.debugElement.query(By.css('.details-input-row'));
    expect(detailsInputRow).toBeTruthy();
    expect(detailsInputRow.nativeElement.childElementCount).toEqual(2);

    const sectionContainer = fixture.debugElement.query(By.css('.section-container'));
    expect(sectionContainer).toBeTruthy();
    expect(sectionContainer.nativeElement.childElementCount).toEqual(2);

    /** Project Division */
    const projectDivision = fixture.debugElement.query(By.css('.project-name-div'));
    expect(projectDivision).toBeTruthy();

    const projectFieldLabel = fixture.debugElement.query(By.css('[data-test=project_label]'));
    expect(projectFieldLabel).toBeTruthy();
    expect(projectFieldLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.EDIT_CALENDAR.PROJECT_NAME');

    projectSelect = fixture.debugElement.query(By.css('[formControlName=projectId]')).componentInstance;
    expect(projectSelect).toBeTruthy();
    elements = projectSelect.options.toArray();

    expect(elements.length).toBe(2);

    projectSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[1]._selectViaInteraction();
    elements[0]._selectViaInteraction();

    expect(selectedCol.length).toBe(2);
    expect(selectedCol).toEqual([2, 1]);

    /** Calendar name Division */
    const nameDivision = fixture.debugElement.query(By.css('.calendar-name-div'));
    expect(nameDivision).toBeTruthy();

    const nameFieldLabel = fixture.debugElement.query(By.css('[data-test=name_label]'));
    expect(nameFieldLabel).toBeTruthy();
    expect(nameFieldLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.EDIT_CALENDAR.CALENDAR_NAME');

    const nameFieldInput = fixture.debugElement.query(By.css('[formControlName=name]'));
    expect(nameFieldInput).toBeTruthy();
    expect(nameFieldInput.properties.placeholder).toEqual('CALENDAR_VIEW.ADD_CALENDAR_FORM.NAME');

    /** Time zone Division */
    const timeZoneDivision = fixture.debugElement.query(By.css('.time-zone-div'));
    expect(timeZoneDivision).toBeTruthy();

    elements = [];
    selectedCol = [];

    const timeZoneFieldLabel = fixture.debugElement.query(By.css('[data-test=time_zone_label]'));
    expect(timeZoneFieldLabel).toBeTruthy();
    expect(timeZoneFieldLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.EDIT_CALENDAR.TIME_ZONE');

    timeZoneSelect = fixture.debugElement.query(By.css('[formControlName=timeZone]')).componentInstance;
    expect(timeZoneSelect).toBeTruthy();
    elements = timeZoneSelect.options.toArray();

    expect(elements.length).toBe(5);

    timeZoneSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[1]._selectViaInteraction();
    elements[0]._selectViaInteraction();
    elements[2]._selectViaInteraction();

    expect(selectedCol.length).toBe(3);
    expect(selectedCol).toEqual(['Pacific/Apia', 'Pacific/Kiritimati', 'Pacific/Enderbury']);

    /** IsPublic Division */
    const isPublicDivision = fixture.debugElement.query(By.css('.is-public-div'));
    expect(isPublicDivision).toBeTruthy();
    expect(isPublicDivision.nativeElement.childElementCount).toEqual(2);

    const isPublicLabel = fixture.debugElement.query(By.css('[data-test=public_label]'));
    expect(isPublicLabel).toBeTruthy();
    expect(isPublicLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.EDIT_CALENDAR.IS_PUBLIC');

    let isPublicSlideToggle = fixture.debugElement.query(By.css('[formControlName=isPublic]'));
    expect(isPublicSlideToggle).toBeTruthy();

    component.isOwner = false;
    fixture.detectChanges();

    expect(isPublicSlideToggle.componentInstance.disabled).toEqual(true);

    /** Description Division */
    const descriptionSection = fixture.debugElement.query(By.css('.description-section'));
    expect(descriptionSection).toBeTruthy();
    expect(descriptionSection.nativeElement.childElementCount).toEqual(2);

    const descriptionLabel = fixture.debugElement.query(By.css('[data-test=description_label]'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('CALENDAR_VIEW.EDIT_CALENDAR.DESCRIPTION:');

    const descriptionRichText = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionRichText).toBeTruthy();

    /** Actions Division */
    const actionsRow = fixture.debugElement.query(By.css('.actions-row'));
    expect(actionsRow).toBeTruthy();
    expect(actionsRow.nativeElement.childElementCount).toEqual(2);

    const saveButton = fixture.debugElement.query(By.css('.save-button'));
    expect(saveButton).toBeTruthy();
    expect(saveButton.nativeElement.textContent).toEqual('SAVE');

    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    expect(cancelButton).toBeTruthy();
    expect(cancelButton.nativeElement.textContent).toEqual('CANCEL');

    component.editCalendarDetails = { ...editCalendarDetails, isPrivate: true };
    component.ngOnChanges({ editCalendarDetails: new SimpleChange(editCalendarDetails, { ...editCalendarDetails, isPrivate: true }, false) });
    fixture.detectChanges();

    isPublicSlideToggle = fixture.debugElement.query(By.css('[formControlName=isPublic]'));
    expect(isPublicSlideToggle.componentInstance.disabled).toEqual(false);

    component.editCalendarDetails = {
      ...editCalendarDetails,
      userPermission: {
        ...editCalendarDetails.userPermission,
        canUpdateVisibility: true,
      },
    };
    component.ngOnChanges({ editCalendarDetails: new SimpleChange(editCalendarDetails, undefined, false) });
    fixture.detectChanges();

    isPublicSlideToggle = fixture.debugElement.query(By.css('[formControlName=isPublic]'));
    expect(isPublicSlideToggle.componentInstance.disabled).toEqual(false);
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

    control.setValue(' Calendar N°1 ');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.NotTrimmed)).toBe(true);
    expect(ErrorType.getErrorMessage(control.errors)).toEqual('Leading or trailing white spaces are not allowed.');

    control.setValue('Calendar N°1');
    expect(control.valid).toEqual(true);
  });

  it('should update the calendar details related to form data', () => {
    const editCalendarForm = fixture.debugElement.query(By.css('form'));
    const nameInput = fixture.debugElement.query(By.css('[formControlName=name]'));
    const publicSlideToggle = fixture.debugElement.query(By.css('[formControlName=isPublic]'));
    const descriptionInput = fixture.debugElement.query(By.css('[formControlName=description]'));
    const saveButton = fixture.debugElement.query(By.css('button[type=submit]'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit').and.callThrough();
    const spyOnUpdatedCalendar = spyOn(component.updateCalendar, 'emit').and.callThrough();
    const spyOnCancelEdit = spyOn(component, 'onCancelEdit').and.callThrough();

    component.ngOnChanges({ editCalendarDetails: new SimpleChange(editCalendarDetails, undefined, true) });
    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.dirty).toEqual(false);
    expect(component.form.controls['projectId'].value).toEqual(1);
    expect(component.form.controls['name'].value).toEqual('Calendar N°1');
    expect(component.form.controls['timeZone'].value).toEqual('Pacific/Kiritimati');
    expect(component.form.controls['description'].value).toEqual('Description');
    expect(component.form.controls['isPublic'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeTruthy();
    expect(cancelButton.properties.disabled).toBeTruthy();

    nameInput.nativeElement.value = 'Calendar N°2';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    nameInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.patchValue({ name: 'Calendar N°2' });

    publicSlideToggle.nativeElement.value = true;
    component.form.patchValue({ isPrivate: true });

    descriptionInput.nativeElement.value = 'Description of Calendar N°2';
    descriptionInput.nativeElement.dispatchEvent(new Event('change'));
    descriptionInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.patchValue({ description: 'Description of Calendar N°2' });
    component.form.markAsDirty();

    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.controls['projectId'].value).toEqual(1);
    expect(component.form.controls['name'].value).toEqual('Calendar N°2');
    expect(component.form.controls['timeZone'].value).toEqual('Pacific/Kiritimati');
    expect(component.form.controls['description'].value).toEqual('Description of Calendar N°2');
    expect(component.form.controls['isPublic'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeFalsy();
    expect(cancelButton.properties.disabled).toBeFalsy();

    editCalendarForm.triggerEventHandler('submit', null);
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();
    expect(component.form.valid).toEqual(true);
    expect(spyOnUpdatedCalendar).toHaveBeenCalled();

    cancelButton.nativeElement.click();
    fixture.detectChanges();

    expect(spyOnCancelEdit).toHaveBeenCalled();
    expect(component.form.controls['projectId'].value).toEqual(1);
    expect(component.form.controls['name'].value).toEqual('Calendar N°1');
    expect(component.form.controls['timeZone'].value).toEqual('Pacific/Kiritimati');
    expect(component.form.controls['description'].value).toEqual('Description');
    expect(component.form.controls['isPublic'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeTruthy();
    expect(cancelButton.properties.disabled).toBeTruthy();
  });
});
