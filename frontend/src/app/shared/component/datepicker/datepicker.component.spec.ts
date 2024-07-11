import { By } from '@angular/platform-browser';
import { MatDatetimepicker } from '@mat-datetimepicker/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { DatepickerComponent } from './datepicker.component';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { dateValidator, trimmedValidator } from '../../../shared/validators/custom-validators';

describe('DatepickerComponent', () => {
  let component: DatepickerComponent;
  let fixture: ComponentFixture<DatepickerComponent>;

  const minDate = new Date('Tue Dec 21 2021 14:00:00 GMT+0100 (Central European Standard Time)');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatepickerComponent],
      imports: [AngularMaterialModule, BrowserAnimationsModule, TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatepickerComponent);
    component = fixture.componentInstance;
    component.minDate = minDate;
    component.pickerId = 'pickerStart';
    component.pickerLabel = 'EVENTS_VIEW.EDIT_EVENT.STARTS_AT';
    component.controlName = 'start';
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
    /** Date picker field */
    const datePickerField = fixture.debugElement.query(By.css('.date-picker'));
    expect(datePickerField).toBeTruthy();

    const datePickerFieldLabel = fixture.debugElement.query(By.css('[data-test=date_label]'));
    expect(datePickerFieldLabel).toBeTruthy();
    expect(datePickerFieldLabel.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.STARTS_AT');

    const datePickerFieldInput = fixture.debugElement.query(By.css('input'));
    expect(datePickerFieldInput).toBeTruthy();
    expect(datePickerFieldInput.properties.readOnly).toEqual(true);

    // tslint:disable-next-line:no-any
    const datePicker: MatDatetimepicker<any> = fixture.debugElement.query(By.css('mat-datetimepicker')).componentInstance;
    expect(datePicker).toBeTruthy();
    expect(datePicker.type).toEqual('date');
    expect(datePicker._minDate).toEqual(minDate);
  });
});
