import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogModel, ItemDetails } from '../../models/index';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.scss'],
})
export class CreateItemComponent {
  public disabled = false;
  public form: FormGroup;
  public selectedValue: number;
  public dataForm: ItemDetails[];
  public onSubmitItem = new EventEmitter();

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogModel, public dialogRef: MatDialogRef<CreateItemComponent>) {}

  ngOnInit(): void {
    this.form = this.data.form;
    this.dataForm = this.data.dataForm;
    if (this.dataForm) {
      this.dataForm.forEach((item: ItemDetails) => {
        item.isChecked = item.isCheckBox && this.form.get(item.name).value ? true : false;
      });
    }
    if (this.form.get('customer')?.value) {
      this.disabled = true;
    }
  }

  onClear(): void {
    this.form.reset();
    this.data.initializeFormGroup();
  }

  onClose(): void {
    this.onClear();
    this.dialogRef.close();
  }

  selectValue(event: number): void {
    this.selectedValue = event;
  }
  onSubmit(): void {
    if (this.form.valid) {
      const emittedValue = this.selectedValue ? { value: this.form.value, customerId: this.selectedValue } : this.form.value;
      this.onSubmitItem.emit(emittedValue);
      this.onClose();
    }
  }
}
