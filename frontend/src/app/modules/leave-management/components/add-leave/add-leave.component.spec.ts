import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { QuillModule } from 'ngx-quill';

import { AddLeaveComponent } from './add-leave.component';

import { UserDetails } from '../../../../shared/models';
import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AddLeaveComponent', () => {
  let component: AddLeaveComponent;
  let fixture: ComponentFixture<AddLeaveComponent>;
  let userSelectBox: MatSelect;
  const userList: UserDetails[] = [
    {
      id: 1,
      firstName: 'Hejer',
      lastName: 'Ayedi',
      login: 'admin',
      email: 'admin@email.com',
      note: 'the user note',
      registrationNumber: 1500,
      isActive: true,
      fullName: 'Hejer Ayedi (admin)',
      globalRoles: [RoleModel.Administrator],
    },
    {
      id: 2,
      firstName: 'Hejer',
      lastName: 'Ayedi',
      login: 'ayedi.hejer',
      email: 'ayedi.hejer@email.com',
      note: 'the user note',
      registrationNumber: 1500,
      isActive: true,
      fullName: 'Hejer Ayedi (ayedi.hejer)',
      globalRoles: [RoleModel.Administrator],
    },
    {
      id: 3,
      firstName: 'Ameni',
      lastName: 'Mouelhi',
      login: 'manager',
      email: 'manager@email.com',
      note: 'the user note',
      registrationNumber: 1500,
      isActive: true,
      fullName: 'Ameni Mouelhi',
      globalRoles: [RoleModel.AccountManager],
    },
    {
      id: 4,
      firstName: 'Ameni',
      lastName: 'Hadj Mbarek',
      login: 'lead',
      email: 'lead@email.com',
      note: 'the user note',
      registrationNumber: 1500,
      isActive: true,
      fullName: 'Ameni Hadj Mbarek',
      globalRoles: [],
    },
    {
      id: 5,
      firstName: 'Med bechir',
      lastName: 'Said',
      login: 'member',
      email: 'member@email.com',
      note: 'the user note',
      registrationNumber: 1500,
      isActive: true,
      fullName: 'Med bechir Said',
      globalRoles: [],
    },
  ];

  const newForm: FormGroup = new FormGroup({
    id: new FormControl(null),
    calendarId: new FormControl(null),
    userId: new FormControl(null),
    start: new FormControl('', [Validators.required]),
    isHalfDayStart: new FormControl(false, [Validators.required]),
    end: new FormControl('', [Validators.required]),
    isHalfDayEnd: new FormControl(false, [Validators.required]),
    leaveType: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    state: new FormControl(''),
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddLeaveComponent],
      imports: [AngularMaterialModule, TranslateModule.forRoot(), BrowserAnimationsModule, FormsModule, ReactiveFormsModule, FlexLayoutModule, QuillModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLeaveComponent);
    component = fixture.componentInstance;
    component.form = newForm;
    component.formVisibility = true;
    component.isHalfDayEndHidden = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the static initial view ', () => {
    const addLeaveContainer = fixture.debugElement.query(By.css('.add-leave-container'));
    const addLeaveForm = fixture.debugElement.query(By.css('.add-leave'));
    const userField = fixture.debugElement.query(By.css('.user-field'));
    const leaveTypeField = fixture.debugElement.query(By.css('.leave-type-field'));
    const isHalfDayStart = fixture.debugElement.query(By.css('.half-day-start-field'));
    const isFullDayEnd = fixture.debugElement.query(By.css('.half-day-end-field'));
    const addButton = fixture.debugElement.query(By.css('.add-button'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));

    expect(addLeaveContainer).toBeTruthy();
    expect(addLeaveForm).toBeTruthy();

    expect(userField).toBeTruthy();
    expect(userField.nativeElement.textContent).toEqual('LEAVES_VIEW.PLACEHOLDERS.USER');

    expect(leaveTypeField).toBeTruthy();
    expect(leaveTypeField.nativeElement.textContent).toEqual('LEAVES_VIEW.PLACEHOLDERS.LEAVE_TYPE');

    expect(isHalfDayStart).toBeTruthy();
    expect(isFullDayEnd).toBeTruthy();

    expect(addButton).toBeTruthy();
    expect(addButton.nativeElement.textContent).toEqual('ADD');

    expect(cancelButton).toBeTruthy();
    expect(cancelButton.nativeElement.textContent).toEqual('CANCEL');
  });

  it('should display users, calenders and types lists correctly and the selected one', () => {
    component.userList = userList;
    component.isAdministrator = true;
    component.currentUserId = 1;
    fixture.detectChanges();

    const userField = fixture.debugElement.query(By.css('.user-field'));
    expect(userField).toBeTruthy();

    const userSelection = fixture.debugElement.query(By.css('.user-field mat-select'));
    userSelectBox = userSelection.componentInstance;
    const elements: MatOption[] = userSelectBox.options.toArray();
    expect(userSelection).toBeTruthy();
    expect(elements.length).toEqual(5);
    expect(elements[0].viewValue).toBe('Hejer Ayedi (admin)');
    expect(elements[1].viewValue).toBe('Hejer Ayedi (ayedi.hejer)');
    expect(elements[2].viewValue).toBe('Ameni Mouelhi');
    expect(elements[3].viewValue).toBe('Ameni Hadj Mbarek');
    expect(elements[4].viewValue).toBe('Med bechir Said');

    expect(userSelection.attributes.disableOptionCentering).toEqual('');
    expect(userSelection.attributes.formControlName).toEqual('userId');
    expect(userSelection.nativeElement.getAttribute('ng-reflect-placeholder')).toEqual('LEAVES_VIEW.PLACEHOLDERS.USER');

    component.isAdministrator = false;
    component.currentUserId = 2;
    component.ngOnChanges({ isAdministrator: new SimpleChange(false, undefined, true) });
    component.formVisibility = true;
    fixture.detectChanges();

    expect((userSelectBox.selected as MatOption).viewValue).toEqual('Hejer Ayedi (ayedi.hejer)');

    const leaveTypeField = fixture.debugElement.query(By.css('.leave-type-field'));
    expect(leaveTypeField).toBeTruthy();

    const leaveTypeSelect = fixture.debugElement.query(By.css('.leave-type-field mat-select'));
    expect(leaveTypeSelect).toBeTruthy();

    const types: MatOption[] = leaveTypeSelect.componentInstance.options.toArray();
    expect(types).toBeTruthy();
    expect(types.length).toEqual(2);
    expect(types[0].viewValue).toBe('Sick');
    expect(types[1].viewValue).toBe('Holiday');
  });

  it('should display the details data: start, end dates and description properly', () => {
    const startDateField = fixture.debugElement.query(By.css('.start-date-field .field-container'));
    expect(startDateField).toBeTruthy();

    const startDate = fixture.debugElement.query(By.css('.start-date'));
    expect(startDate).toBeTruthy();
    expect(startDate.nativeElement.childElementCount).toEqual(4);

    const startDateInput = fixture.debugElement.query(By.css('.start-input'));
    expect(startDateInput).toBeTruthy();
    expect(startDateInput.attributes.placeholder).toEqual('LEAVES_VIEW.PLACEHOLDERS.START_DATE');

    const halfStartDay = fixture.debugElement.query(By.css('.half-day-start-field'));
    expect(halfStartDay).toBeTruthy();
    expect(halfStartDay.nativeElement.innerText).toEqual('LEAVES_VIEW.ADD_LEAVE.HALF_DAY');

    const endDateField = fixture.debugElement.query(By.css('.end-date-field .field-container'));
    expect(endDateField).toBeTruthy();

    let endDate = fixture.debugElement.query(By.css('.end-date'));
    expect(endDate).toBeTruthy();
    expect(endDate.nativeElement.childElementCount).toEqual(4);

    const endDateInput = fixture.debugElement.query(By.css('.end-input'));
    expect(endDateInput).toBeTruthy();
    expect(endDateInput.attributes.placeholder).toEqual('LEAVES_VIEW.PLACEHOLDERS.END_DATE');

    let halfEndDay = fixture.debugElement.query(By.css('.half-day-end-field'));
    expect(halfEndDay).toBeTruthy();

    expect(halfEndDay.nativeElement.innerText).toEqual('LEAVES_VIEW.ADD_LEAVE.HALF_DAY');

    const descriptionLabel = fixture.debugElement.query(By.css('.description-label'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('LEAVES_VIEW.ADD_LEAVE.DESCRIPTION :');

    const descriptionRichTextEditor = fixture.debugElement.query(By.css('.description-richText-editor'));
    expect(descriptionRichTextEditor).toBeTruthy();

    component.isHalfDayEndHidden = true;
    fixture.detectChanges();

    endDate = fixture.debugElement.query(By.css('.end-date'));
    expect(endDate).toBeTruthy();
    expect(endDate.nativeElement.childElementCount).toEqual(3);

    halfEndDay = fixture.debugElement.query(By.css('.half-day-end-field'));
    expect(halfEndDay).toBeFalsy();
  });

  it('should display the form buttons content properly', () => {
    const buttonsContent = fixture.debugElement.query(By.css('.buttons-content'));
    expect(buttonsContent).toBeTruthy();
    expect(buttonsContent.nativeElement.childElementCount).toEqual(2);

    const submitButton = fixture.debugElement.query(By.css('.add-button'));
    expect(submitButton).toBeTruthy();

    expect(submitButton.properties.disabled).toEqual(true);
    expect(submitButton.nativeElement.textContent).toEqual('ADD');

    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    expect(cancelButton).toBeTruthy();
    expect(cancelButton.attributes.color).toEqual('warn');
    expect(cancelButton.nativeElement.textContent).toEqual('CANCEL');

    newForm.setValue({
      id: 1,
      calendarId: 1,
      userId: 1,
      start: new Date('2021-01-01T15:53:09.703Z'),
      isHalfDayStart: true,
      end: new Date('2021-01-01T15:53:09.703Z'),
      isHalfDayEnd: true,
      leaveType: 'Sick',
      description: 'Sick',
      state: '',
    });
    component.form = newForm;
    fixture.detectChanges();

    expect(submitButton.properties.disabled).toEqual(false);
  });
});
