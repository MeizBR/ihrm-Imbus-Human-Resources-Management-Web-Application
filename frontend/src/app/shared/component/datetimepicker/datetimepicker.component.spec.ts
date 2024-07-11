import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDatetimepicker } from '@mat-datetimepicker/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { DatetimepickerComponent } from './datetimepicker.component';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { dateValidator, trimmedValidator } from '../../../shared/validators/custom-validators';

describe('DatetimepickerComponent', () => {
  let component: DatetimepickerComponent;
  let fixture: ComponentFixture<DatetimepickerComponent>;

  const minDate = new Date('Tue Dec 21 2021 14:00:00 GMT+0100 (Central European Standard Time)');
  const maxDate = new Date('Tue Dec 21 2021 23:59:00 GMT+0100 (Central European Standard Time)');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatetimepickerComponent],
      imports: [AngularMaterialModule, BrowserAnimationsModule, TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimepickerComponent);
    component = fixture.componentInstance;
    component.minDate = minDate;
    component.maxDate = maxDate;
    component.pickerId = 'pickerEnd';
    component.pickerLabel = 'EVENTS_VIEW.EDIT_EVENT.ENDS_AT';
    component.controlName = 'end';
    component.parentForm = new FormGroup(
      {
        id: new FormControl(null),
        calendarId: new FormControl(null, Validators.required),
        start: new FormControl('', Validators.required),
        end: new FormControl('', Validators.required),
        title: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
        description: new FormControl(''),
        repetition: new FormControl(''),
        allDay: new FormControl(true, Validators.required),
        eventType: new FormControl(''),
      },
      { validators: dateValidator },
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should display the edit card content data correctly', () => {
    /** Date time picker field */
    const dateTimePickerField = fixture.debugElement.query(By.css('.date-time-picker'));
    expect(dateTimePickerField).toBeTruthy();

    const dateTimePickerFieldLabel = fixture.debugElement.query(By.css('[data-test=date_label]'));
    expect(dateTimePickerFieldLabel).toBeTruthy();
    expect(dateTimePickerFieldLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.ENDS_AT');

    const dateTimePickerFieldInput = fixture.debugElement.query(By.css('input'));
    expect(dateTimePickerFieldInput).toBeTruthy();
    expect(dateTimePickerFieldInput.properties.readOnly).toEqual(true);

    // tslint:disable-next-line:no-any
    const dateTimePicker: MatDatetimepicker<any> = fixture.debugElement.query(By.css('mat-datetimepicker')).componentInstance;
    expect(dateTimePicker).toBeTruthy();
    expect(dateTimePicker.type).toEqual('datetime');
    expect(dateTimePicker._minDate).toEqual(minDate);
  });
});
