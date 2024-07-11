import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

import { customersForm, extractCustomerUpdatesFromForm } from '../../customer-helpers';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CustomerDetailedPermissions, CustomerForUpdate } from '../../../../shared/models';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCustomerComponent implements OnChanges, OnDestroy {
  @Input() error: ErrorType | undefined;
  @Input() editCustomerDetails: CustomerDetailedPermissions;

  @Output() onDeleteCustomer = new EventEmitter<number>();
  @Output() updateCustomer = new EventEmitter<CustomerForUpdate>();

  public hintMessage = '';
  public form: FormGroup;
  public submitted = false;
  public ErrorType = ErrorType;

  constructor() {
    this.form = customersForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editCustomerDetails'] && this.editCustomerDetails) {
      this.form.reset();
      this.form.setValue({
        id: this.editCustomerDetails?.id,
        name: this.editCustomerDetails?.name,
        description: this.editCustomerDetails?.description,
        isActive: this.editCustomerDetails?.isActive,
      });
    }
  }

  ngOnDestroy(): void {
    this.form.setValue({ id: '', name: '', description: '', isActive: '' });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const editedCustomer: CustomerForUpdate = extractCustomerUpdatesFromForm();
      this.updateCustomer.emit(editedCustomer);
    }
  }

  public onCancelEdit(): void {
    this.form.reset();
    this.form.setValue({
      id: this.editCustomerDetails?.id,
      name: this.editCustomerDetails?.name,
      description: this.editCustomerDetails?.description,
      isActive: this.editCustomerDetails?.isActive,
    });
  }

  public deleteCustomer(): void {
    this.onDeleteCustomer.emit(this.editCustomerDetails.id);
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }
}
