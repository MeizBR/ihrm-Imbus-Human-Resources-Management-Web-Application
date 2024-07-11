import { FormGroup } from '@angular/forms';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ErrorType } from '../../validators/validation-error-type';

@Component({
  selector: 'app-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss'],
})
export class DatetimepickerComponent implements OnChanges {
  @Input() minDate: Date;
  @Input() maxDate: Date;
  @Input() pickerId: string;
  @Input() pickerLabel: string;
  @Input() controlName: string;
  @Input() parentForm: FormGroup;

  public ErrorType = ErrorType;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['maxDate'] && this.maxDate) || (changes['minDate'] && this.minDate)) {
      this.maxDate = new Date(this.maxDate);
      this.maxDate.setHours(23, 59, 0).toLocaleString();
    }
  }
}
