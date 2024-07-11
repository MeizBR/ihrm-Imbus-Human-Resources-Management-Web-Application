import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogModel } from '../../../shared/models/dialogModel';

@Component({
  selector: 'app-add-progress-column',
  templateUrl: './add-progress-column.component.html',
  styleUrls: ['./add-progress-column.component.scss'],
})
export class AddProgressColumnComponent implements OnInit {
  // @Output() onSubmitItem = new EventEmitter();

  // public form: FormGroup;
  // public selectedKey: ColumnHeaderKey;
  // public selectedName: string;
  // public columnHeaderKey: string[] = [];
  // public allTextHeader: string[];
  // public columnHeaderText: string[] | string = [];
  // public ProgressColumn = ProgressColumn;

  constructor(@Inject(MAT_DIALOG_DATA) public dialogModelData: DialogModel, public dialogRef: MatDialogRef<AddProgressColumnComponent>) {
    // this.form = dialogModelData.form;
    // this.allTextHeader = this.ProgressColumn.getColumnHeaderTextValues().map(col => this.ProgressColumn.columnHeaderTextToString(col));
    // this.columnHeaderText = lodash.difference(this.allTextHeader, dialogModelData.columns);
    // this.columnHeaderKey = this.ProgressColumn.getColumnHeaderKeyValues(); // NOTE: It's better to implement a function that return list of columns keys
  }

  ngOnInit(): void {
    // this.selectedName = this.columnHeaderText[0];
  }

  // public onClear(): void {
  //   this.form.reset();
  //   this.dialogModelData.initializeFormGroup();
  // }

  // public onClose(): void {
  //   this.onClear();
  //   this.dialogRef.close();
  // }

  // public onSubmit(): void {
  //   if (this.form.valid) {
  //     this.selectedKey = ProgressColumn.getCorrespondingKey(this.selectedName);
  //     this.onSubmitItem.emit({ form: this.form.value, key: this.selectedKey });
  //     this.onClose();
  //   }
  // }
}
