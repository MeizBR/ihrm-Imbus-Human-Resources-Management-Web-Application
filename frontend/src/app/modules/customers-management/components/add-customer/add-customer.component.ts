import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

import { customersForm, initializeCustomerFormGroup } from '../../customer-helpers';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CustomerForAdd } from '../../../../shared/models/customer-models/customer-models-index';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
})
export class AddCustomerComponent implements OnInit, OnChanges {
  public form: FormGroup;

  @Input() error: ErrorType | undefined;
  @Input() isCustomersLoading: boolean | undefined;
  @Output() onAdd = new EventEmitter<CustomerForAdd>();

  public ErrorType = ErrorType;
  public formVisibility = false;

  constructor() {}

  ngOnInit(): void {
    this.form = customersForm;
  }

  ngOnChanges(): void {
    if (!this.error && !this.isCustomersLoading) {
      this.onClear();
    } else {
      this.handleError(this.error);
    }
  }

  public createCustomer(): void {
    this.formVisibility = true;
  }

  public onClear(): void {
    this.form?.reset();
    initializeCustomerFormGroup();

    this.formVisibility = false;
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.onAdd.emit({
        name: this.form.controls['name'].value,
        description: this.form.controls['description'].value,
        isActive: this.form.controls['isActive'].value,
      });
    }
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }

  private handleError(errorType: ErrorType | undefined): void {
    if (errorType === ErrorType.NameAlreadyExists) {
      this.form.controls['name'].setErrors({ [ErrorType.NameAlreadyExists]: true });
    }
  }
}
