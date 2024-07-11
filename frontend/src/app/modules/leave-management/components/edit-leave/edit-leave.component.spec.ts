import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { QuillModule } from 'ngx-quill';

import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { reducers } from '../../../../core/reducers';

import { EditLeaveComponent } from './edit-leave.component';

import { leaveForm } from '../../leaves-helpers';
import { LeaveDetails } from '../../../../shared/models';
import { ErrorType } from '../../../../shared/validators';
import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('EditLeaveComponent', () => {
  let component: EditLeaveComponent;
  let fixture: ComponentFixture<EditLeaveComponent>;
  let leaveTypeSelect: MatSelect;
  let elements: MatOption[] = [];

  const editLeaveDetails: LeaveDetails = {
    id: 1,
    start: new Date(2020, 8, 1),
    isHalfDayStart: true,
    end: new Date(2020, 8, 5),
    isHalfDayEnd: true,
    userId: 1,
    leaveType: LeaveType.Holiday,
    description: 'Holiday leave description',
    state: LeaveState.Pending,
    comment: '',
    userName: 'Doe John',
    isActiveUser: true,
    editPermission: {
      canEdit: true,
      canEditData: true,
      canEditStatus: true,
      canEditDescription: true,
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditLeaveComponent],
      imports: [
        AngularMaterialModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        QuillModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLeaveComponent);
    component = fixture.componentInstance;
    component.editLeaveDetails = editLeaveDetails;
    component.isAdministrator = true;
    component.isOwner = true;
    component.isLeaveDataEditable = true;
    component.isLeaveDescriptionEditable = true;
    component.LeaveState = LeaveState;
    component.LeaveType = LeaveType;
    component.stateValues = [LeaveState.InProgress, LeaveState.Approved, LeaveState.Refused];
    component.form = leaveForm;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the header card correctly', () => {
    const leaveCard = fixture.debugElement.query(By.css('.leave-card'));
    expect(leaveCard).toBeTruthy();
    expect(leaveCard.nativeElement.childElementCount).toEqual(2);

    const cardHeaderText = fixture.debugElement.query(By.css('.leave-card .card-header-text'));
    expect(cardHeaderText).toBeTruthy();
    expect(leaveCard.nativeElement.childElementCount).toEqual(2);

    const cardTitle = fixture.debugElement.query(By.css('.leave-card .card-header-text .card-title'));
    expect(cardTitle).toBeTruthy();
    expect(cardTitle.nativeElement.textContent).toEqual(' LEAVES_VIEW.EDIT_LEAVE.LEAVE_DETAILS : LEAVES_VIEW.STATE.PENDINGhourglass_empty');

    const stateSpan = fixture.debugElement.query(By.css('.leave-card .card-header-text .card-title .state-span'));
    expect(stateSpan).toBeTruthy();
    expect(stateSpan.nativeElement.textContent).toEqual('LEAVES_VIEW.STATE.PENDING');

    const stateIcon = fixture.debugElement.query(By.css('.leave-card .card-header-text .card-title .state-icon'));
    expect(stateIcon).toBeTruthy();
    expect(stateIcon.nativeElement.textContent).toEqual('hourglass_empty');

    const cardHeaderState = fixture.debugElement.query(By.css('.leave-card .card-header-text .card-header-state'));
    expect(cardHeaderState).toBeTruthy();
    expect(cardHeaderState.nativeElement.childElementCount).toEqual(1);

    const stateButtonsRow = fixture.debugElement.query(By.css('.leave-card .card-header-text .card-header-state .state-button-row'));
    expect(stateButtonsRow).toBeTruthy();

    expect(stateButtonsRow.nativeElement.childElementCount).toEqual(3);

    const stateButtons = fixture.debugElement.queryAll(By.css('.leave-card .card-header-text .card-header-state .state-button-row button'));
    expect(stateButtons).toBeTruthy();
    expect(stateButtons.length).toEqual(3);

    const inProgressButton = stateButtons[0];
    expect(inProgressButton).toBeTruthy();
    expect(inProgressButton.nativeElement.textContent).toEqual('rotate_right');

    const approvedButton = stateButtons[1];
    expect(approvedButton).toBeTruthy();
    expect(approvedButton.nativeElement.textContent).toEqual('done');

    const refusedButton = stateButtons[2];
    expect(refusedButton).toBeTruthy();
    expect(refusedButton.nativeElement.textContent).toEqual('block');
  });

  it('should display the edit card content data correctly when modification of description and data is allowed', () => {
    component.ngOnChanges({ editLeaveDetails: new SimpleChange(editLeaveDetails, undefined, true) });
    fixture.detectChanges();

    const leaveCardContent = fixture.debugElement.query(By.css('.leave-card .card-content'));
    expect(leaveCardContent).toBeTruthy();
    expect(leaveCardContent.nativeElement.childElementCount).toEqual(1);

    const editLeaveFormContent = fixture.debugElement.query(By.css('.leave-card .card-content .edit-leave-form'));
    expect(editLeaveFormContent).toBeTruthy();
    expect(editLeaveFormContent.nativeElement.childElementCount).toEqual(1);

    const editEventForm = fixture.debugElement.query(By.css('form'));
    expect(editEventForm).toBeTruthy();
    expect(editEventForm.nativeElement.childElementCount).toEqual(3);

    const leaveDetails = fixture.debugElement.query(By.css('.leave-details'));
    expect(leaveDetails).toBeTruthy();
    expect(leaveDetails.nativeElement.childElementCount).toEqual(2);

    const leaveData = fixture.debugElement.query(By.css('.leave-data'));
    expect(leaveData).toBeTruthy();
    expect(leaveData.nativeElement.childElementCount).toEqual(2);

    const leaveInfo = leaveData.children[0];
    expect(leaveInfo).toBeTruthy();
    expect(leaveInfo.nativeElement.childElementCount).toEqual(2);

    // NOTE: this filed was changed in other branch, so its test will be improved later
    const userField = fixture.debugElement.query(By.css('.user-field'));
    expect(userField).toBeTruthy();

    const leaveTypeField = fixture.debugElement.query(By.css('.leave-type-field'));
    expect(leaveTypeField).toBeTruthy();

    leaveTypeSelect = fixture.debugElement.query(By.css('[formControlName=leaveType]')).componentInstance;
    expect(leaveTypeSelect).toBeTruthy();

    elements = leaveTypeSelect.options.toArray();
    expect(elements.length).toBe(2);
    const selectedCol = [];
    leaveTypeSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[0]._selectViaInteraction();
    elements[1]._selectViaInteraction();
    expect(selectedCol).toEqual(['Sick', 'Holiday']);

    const leaveDate = leaveData.children[1];
    expect(leaveDate).toBeTruthy();
    expect(leaveDate.nativeElement.childElementCount).toEqual(2);

    const startDateFiled = fixture.debugElement.query(By.css('.start-date-field'));
    expect(startDateFiled).toBeTruthy();

    const startDate = fixture.debugElement.query(By.css('.start-date-field mat-form-field'));
    expect(startDate).toBeTruthy();

    const startDateLabel = fixture.debugElement.query(By.css('.start-date-field mat-form-field mat-label'));
    expect(startDateLabel).toBeTruthy();
    expect(startDateLabel.nativeElement.textContent).toEqual('LEAVES_VIEW.PLACEHOLDERS.START_DATE');

    const startDateContent = fixture.debugElement.query(By.css('.start-date-field mat-form-field .start-date'));
    expect(startDateContent).toBeTruthy();
    expect(startDateContent.nativeElement.childElementCount).toEqual(4);

    const halfDayStartField = fixture.debugElement.query(By.css('.start-date-field mat-form-field .start-date .half-day-start-field'));
    expect(halfDayStartField).toBeTruthy();
    expect(halfDayStartField.nativeElement.innerText).toEqual('LEAVES_VIEW.ADD_LEAVE.HALF_DAY');
    expect(halfDayStartField.componentInstance.disabled).toEqual(false);

    const endDateFiled = fixture.debugElement.query(By.css('.end-date-field'));
    expect(endDateFiled).toBeTruthy();

    const endDate = fixture.debugElement.query(By.css('.end-date-field mat-form-field'));
    expect(endDate).toBeTruthy();

    const endDateLabel = fixture.debugElement.query(By.css('.end-date-field mat-form-field mat-label'));
    expect(endDateLabel).toBeTruthy();
    expect(endDateLabel.nativeElement.textContent).toEqual('LEAVES_VIEW.PLACEHOLDERS.END_DATE');

    const endDateContent = fixture.debugElement.query(By.css('.end-date-field mat-form-field .end-date'));
    expect(endDateContent).toBeTruthy();
    expect(endDateContent.nativeElement.childElementCount).toEqual(4);

    const halfDayEndField = fixture.debugElement.query(By.css('.end-date-field mat-form-field .end-date .half-day-end-field'));
    expect(halfDayEndField).toBeTruthy();
    expect(halfDayEndField.nativeElement.innerText).toEqual('LEAVES_VIEW.ADD_LEAVE.HALF_DAY');
    expect(halfDayEndField.componentInstance.disabled).toEqual(false);

    const descriptionContainer = fixture.debugElement.query(By.css('.description-container'));
    expect(descriptionContainer).toBeTruthy();
    expect(descriptionContainer.nativeElement.childElementCount).toEqual(2);

    const descriptionLabel = fixture.debugElement.query(By.css('.description-label'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.innerText).toEqual('LEAVES_VIEW.ADD_LEAVE.DESCRIPTION :');

    const descriptionRichText = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionRichText).toBeTruthy();
    expect(descriptionRichText.componentInstance.placeholder).toEqual('LEAVES_VIEW.EDIT_LEAVE.PLACEHOLDER');

    const commentContainer = fixture.debugElement.query(By.css('.comment-container'));
    expect(commentContainer).toBeTruthy();
    expect(commentContainer.nativeElement.childElementCount).toEqual(2);

    const commentLabel = fixture.debugElement.query(By.css('.comment-label'));
    expect(commentLabel).toBeTruthy();
    expect(commentLabel.nativeElement.innerText).toEqual('LEAVES_VIEW.ADD_LEAVE.COMMENT :');

    const commentRichText = fixture.debugElement.query(By.css('[formControlName=comment]'));
    expect(commentRichText).toBeTruthy();
    expect(commentRichText.componentInstance.placeholder).toEqual('LEAVES_VIEW.EDIT_LEAVE.PLACEHOLDER');

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

  it('should display the edit card content data correctly when modification of description and data is not allowed', () => {
    component.editLeaveDetails = {
      ...editLeaveDetails,
      editPermission: {
        canEdit: true,
        canEditData: false,
        canEditStatus: true,
        canEditDescription: false,
      },
    };
    component.ngOnChanges({ editLeaveDetails: new SimpleChange(editLeaveDetails, undefined, true) });
    component.isLeaveDataEditable = false;
    component.isLeaveDescriptionEditable = false;
    fixture.detectChanges();

    const leaveDetails = fixture.debugElement.query(By.css('.leave-details'));
    expect(leaveDetails).toBeTruthy();
    expect(leaveDetails.classes['section-disabled']).toEqual(true);
    expect(leaveDetails.nativeElement.childElementCount).toEqual(3);

    const leaveData = fixture.debugElement.query(By.css('.leave-data'));
    expect(leaveData).toBeTruthy();
    expect(leaveData.classes['section-disabled']).toBeUndefined();
    expect(leaveData.nativeElement.childElementCount).toEqual(2);

    const leaveInfo = leaveData.children[0];
    expect(leaveInfo).toBeTruthy();
    expect(leaveInfo.nativeElement.childElementCount).toEqual(2);

    const leaveTypeField = fixture.debugElement.query(By.css('.leave-type-field'));

    expect(leaveTypeField).toBeTruthy();

    leaveTypeSelect = fixture.debugElement.query(By.css('[formControlName=leaveType]')).componentInstance;
    expect(leaveTypeSelect.disabled).toEqual(true);

    const leaveDate = leaveData.children[1];
    expect(leaveDate).toBeTruthy();
    expect(leaveDate.nativeElement.childElementCount).toEqual(2);

    const startDateFiled = fixture.debugElement.query(By.css('.start-date-field'));
    expect(startDateFiled).toBeTruthy();

    const startDate = fixture.debugElement.query(By.css('.start-date-field mat-form-field'));
    expect(startDate).toBeTruthy();
    expect(startDate.classes['start-field-container']).toEqual(true);

    const halfDayStartField = fixture.debugElement.query(By.css('.start-date-field mat-form-field .start-date .half-day-start-field'));
    expect(halfDayStartField).toBeTruthy();
    expect(halfDayStartField.componentInstance.disabled).toEqual(true);

    const endDateFiled = fixture.debugElement.query(By.css('.end-date-field'));
    expect(endDateFiled).toBeTruthy();

    const endDate = fixture.debugElement.query(By.css('.end-date-field mat-form-field'));
    expect(endDate).toBeTruthy();
    expect(endDate.classes['end-field-container']).toEqual(true);

    const halfDayEndStartField = fixture.debugElement.query(By.css('.end-date-field mat-form-field .end-date .half-day-end-field'));
    expect(halfDayEndStartField).toBeTruthy();
    expect(halfDayEndStartField.componentInstance.disabled).toEqual(true);

    const descriptionContainer = fixture.debugElement.query(By.css('.description-container'));
    expect(descriptionContainer).toBeTruthy();
    expect(descriptionContainer.nativeElement.childElementCount).toEqual(2);

    const descriptionViewMode = fixture.debugElement.query(By.css('quill-view-html'));
    expect(descriptionViewMode).toBeTruthy();
    expect(descriptionViewMode.componentInstance.content).toEqual('Holiday leave description');

    const actionsContainer = fixture.debugElement.query(By.css('.actions-container'));
    expect(actionsContainer).toBeTruthy();
  });

  it('should display the edit card content data correctly when only modification of description is allowed', () => {
    component.editLeaveDetails = {
      ...editLeaveDetails,
      editPermission: {
        canEdit: true,
        canEditData: false,
        canEditStatus: true,
        canEditDescription: true,
      },
    };
    component.ngOnChanges({ editLeaveDetails: new SimpleChange(editLeaveDetails, undefined, true) });
    component.isLeaveDataEditable = false;
    component.isLeaveDescriptionEditable = true;
    fixture.detectChanges();

    const leaveData = fixture.debugElement.query(By.css('.leave-data'));
    expect(leaveData).toBeTruthy();
    expect(leaveData.classes['section-disabled']).toEqual(true);
    expect(leaveData.nativeElement.childElementCount).toEqual(3);

    const lockIcon = fixture.debugElement.query(By.css('.leave-data .lock-icon'));
    expect(lockIcon).toBeTruthy();
    expect(lockIcon.nativeElement.textContent).toEqual('lock');
  });

  it('should display the edit card content data correctly when only modification of data is allowed', () => {
    component.editLeaveDetails = {
      ...editLeaveDetails,
      editPermission: {
        canEdit: true,
        canEditData: true,
        canEditStatus: true,
        canEditDescription: false,
      },
    };
    component.ngOnChanges({ editLeaveDetails: new SimpleChange(editLeaveDetails, undefined, true) });
    component.isLeaveDataEditable = true;
    component.isLeaveDescriptionEditable = false;
    fixture.detectChanges();

    const leaveDetails = fixture.debugElement.query(By.css('.leave-details'));
    expect(leaveDetails).toBeTruthy();
    expect(leaveDetails.classes['section-disabled']).toBeFalsy();
    expect(leaveDetails.nativeElement.childElementCount).toEqual(2);

    const lockIcon = fixture.debugElement.query(By.css('.leave-details .lock-icon'));
    expect(lockIcon).toBeFalsy();

    const leaveData = fixture.debugElement.query(By.css('.leave-data'));
    expect(leaveData).toBeTruthy();
    expect(leaveData.classes['section-disabled']).toBeFalsy();
    expect(leaveData.nativeElement.childElementCount).toEqual(2);

    const leaveDate = leaveData.children[1];
    expect(leaveDate).toBeTruthy();
    expect(leaveDate.nativeElement.childElementCount).toEqual(2);

    const startDateFiled = fixture.debugElement.query(By.css('.start-date-field'));
    expect(startDateFiled).toBeTruthy();

    const startDate = fixture.debugElement.query(By.css('.start-date-field mat-form-field'));
    expect(startDate).toBeTruthy();
    expect(startDate.classes['start-field-container']).toBeFalsy();

    const halfDayStartField = fixture.debugElement.query(By.css('.start-date-field mat-form-field .start-date .half-day-start-field'));
    expect(halfDayStartField).toBeTruthy();
    expect(halfDayStartField.componentInstance.disabled).toBeFalsy();

    const endDateFiled = fixture.debugElement.query(By.css('.end-date-field'));
    expect(endDateFiled).toBeTruthy();

    const endDate = fixture.debugElement.query(By.css('.end-date-field mat-form-field'));
    expect(endDate).toBeTruthy();
    expect(endDate.classes['end-field-container']).toBeFalsy();

    const halfDayEndStartField = fixture.debugElement.query(By.css('.end-date-field mat-form-field .end-date .half-day-end-field'));
    expect(halfDayEndStartField).toBeTruthy();
    expect(halfDayEndStartField.componentInstance.disabled).toBeFalsy();

    const descriptionContainer = fixture.debugElement.query(By.css('.description-container'));
    expect(descriptionContainer).toBeTruthy();
    expect(descriptionContainer.nativeElement.childElementCount).toEqual(2);

    const descriptionViewMode = fixture.debugElement.query(By.css('quill-view-html'));
    expect(descriptionViewMode).toBeTruthy();
    expect(descriptionViewMode.componentInstance.content).toEqual('Holiday leave description');

    const actionsContainer = fixture.debugElement.query(By.css('.actions-container'));
    expect(actionsContainer).toBeTruthy();
  });

  it('date validator should work correctly', () => {
    const startDate = component.form.get('start');
    const endDate = component.form.get('end');

    startDate.setValue('');
    endDate.setValue('');
    expect(startDate.valid).toEqual(false);
    expect(startDate.hasError(ErrorType.Required)).toBe(true);
    expect(endDate.valid).toEqual(false);
    expect(endDate.hasError(ErrorType.Required)).toBe(true);

    endDate.setValue('2021-12-11');
    expect(startDate.valid).toEqual(false);
    expect(startDate.hasError(ErrorType.MustSelectStartDate)).toBe(true);

    startDate.setValue('2021-12-12');
    expect(startDate.valid).toEqual(false);
    expect(startDate.hasError(ErrorType.LesserDate)).toBe(true);
  });

  it('should update the leave details related to form data', () => {
    component.ngOnChanges({ editLeaveDetails: new SimpleChange(editLeaveDetails, undefined, true) });
    fixture.detectChanges();

    const editLeaveForm = fixture.debugElement.query(By.css('form'));
    const startField = fixture.debugElement.query(By.css('[formControlName=start]'));
    const endField = fixture.debugElement.query(By.css('[formControlName=end]'));
    const saveButton = fixture.debugElement.query(By.css('button[type=submit]'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit').and.callThrough();
    const spyOnUpdatedLeaveData = spyOn(component.updateLeave, 'emit').and.callThrough();

    expect(component.form.valid).toEqual(true);
    expect(component.form.dirty).toEqual(false);
    expect(component.form.controls['userId'].value).toEqual(1);
    expect(component.form.controls['start'].value).toEqual(editLeaveDetails.start);
    expect(component.form.controls['isHalfDayStart'].value).toEqual(true);
    expect(component.form.controls['end'].value).toEqual(editLeaveDetails.end);
    expect(component.form.controls['isHalfDayEnd'].value).toEqual(true);
    expect(component.form.controls['leaveType'].value).toEqual(LeaveType.Holiday);
    expect(component.form.controls['description'].value).toEqual('Holiday leave description');
    expect(component.form.controls['state'].value).toEqual(LeaveState.Pending);
    expect(component.form.controls['comment'].value).toEqual('');
    expect(saveButton.properties.disabled).toBeTruthy();
    expect(cancelButton.properties.disabled).toBeTruthy();

    startField.nativeElement.value = new Date(2021, 10, 1);
    startField.nativeElement.dispatchEvent(new Event('input'));
    expect(component.form.valid).toEqual(false);
    expect(component.form.dirty).toEqual(true);
    expect(component.form.get('start').hasError(ErrorType.LesserDate)).toBe(true);

    endField.nativeElement.value = new Date(2021, 10, 1);
    endField.nativeElement.dispatchEvent(new Event('input'));
    expect(component.form.valid).toEqual(true);
    expect(component.form.dirty).toEqual(true);
    expect(component.form.controls['end'].value).toEqual(new Date(2021, 10, 1));

    editLeaveForm.triggerEventHandler('submit', null);
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();
    expect(component.form.valid).toEqual(true);
    expect(spyOnUpdatedLeaveData).toHaveBeenCalled();

    cancelButton.nativeElement.click();
    fixture.detectChanges();
  });

  it('should update the leave state correctly', () => {
    component.ngOnChanges({ editLeaveDetails: new SimpleChange(editLeaveDetails, undefined, true) });
    fixture.detectChanges();

    const spyOnUpdateState = spyOn(component, 'onUpdateState').and.callThrough();
    const spyOnUpdatedLeaveStatus = spyOn(component.updateLeaveStatus, 'emit').and.callThrough();

    const stateButtons = fixture.debugElement.queryAll(By.css('.leave-card .card-header-text .card-header-state .state-button-row button'));
    expect(stateButtons).toBeTruthy();

    stateButtons[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(spyOnUpdateState).toHaveBeenCalledWith(LeaveState.InProgress);
    expect(spyOnUpdatedLeaveStatus).toHaveBeenCalledWith({
      leave: { state: LeaveState.InProgress },
      leaveId: editLeaveDetails?.id,
    });

    stateButtons[1].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(spyOnUpdateState).toHaveBeenCalledWith(LeaveState.Approved);
    expect(spyOnUpdatedLeaveStatus).toHaveBeenCalledWith({
      leave: { state: LeaveState.Approved },
      leaveId: editLeaveDetails?.id,
    });
  });
});
