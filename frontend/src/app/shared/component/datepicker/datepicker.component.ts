import { FormGroup } from '@angular/forms';
import { Component, Input } from '@angular/core';

import { ErrorType } from 'src/app/shared/validators/validation-error-type';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
})
export class DatepickerComponent {
  @Input() minDate: Date;
  @Input() pickerId: string;
  @Input() pickerLabel: string;
  @Input() controlName: string;
  @Input() parentForm: FormGroup;

  public ErrorType = ErrorType;

  constructor() {}
}
