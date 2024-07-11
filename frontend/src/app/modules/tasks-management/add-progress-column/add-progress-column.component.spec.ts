import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AddProgressColumnComponent } from './add-progress-column.component';

import { SharedModule } from '../../../shared/shared.module';
import { AngularMaterialModule } from '../../../shared/angular-material/angular-material.module';

// NOTE: Unit test should be implemented for component to test it in low level independently of the other components and the workflow!
xdescribe('ColumnFormComponent', () => {
  let component: AddProgressColumnComponent;
  let fixture: ComponentFixture<AddProgressColumnComponent>;
  // const mockForm: FormGroup = new FormGroup({
  //   id: new FormControl(null),
  //   columnName: new FormControl(null, [Validators.required]),
  //   index: new FormControl(null, [Validators.required]),
  // });
  const dialogMock = { close: () => {} };
  // const mockDialogModelData: DialogModel = { title: 'create column', form: null, initializeFormGroup: null };
  // const mockColumHeaderText: string[] = ['Other', 'In Progress'];
  // const mockAllTextHeader: string[] = ['To Do', 'In Progress', 'In Review'];
  // let matSelector: MatSelect;
  // let elements: MatOption[];
  // let selectedCol: string[] = [];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, SharedModule, HttpClientModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule],
      declarations: [AddProgressColumnComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProgressColumnComponent);
    component = fixture.componentInstance;
    // component.ngOnInit();
    // component.columnHeaderText = mockColumHeaderText;
    // component.allTextHeader = mockAllTextHeader;
    // mockDialogModelData.form = mockForm;
    // mockDialogModelData.initializeFormGroup = () => mockForm.setValue({ id: null, columnName: '', index: '' });
    // component.dialogModelData = mockDialogModelData;
    // component.form = mockDialogModelData.form;
    // selectedCol = [];
    // elements = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should accept only validated index', () => {
  //   const columnIndexInput = fixture.debugElement.query(By.css('.field-line-content input'));

  //   expect(columnIndexInput.nativeElement).toBeTruthy();
  //   expect(columnIndexInput.nativeElement.getAttribute('type')).toEqual('number');
  //   expect(columnIndexInput.nativeElement.getAttribute('min')).toEqual('0');
  //   expect(columnIndexInput.nativeElement.getAttribute('max')).toEqual((mockAllTextHeader.length - 1).toString());

  //   component.form.controls['index'].setValue('');
  //   expect(component.form.invalid).toBeTruthy();
  //   expect(component.form.valid).toBeFalsy();

  //   // NOTE: should be verified after merging with fixes task IHRM-78
  //   // component.form.controls['index'].setValue(-1);
  //   // expect(component.form.invalid).toBeTruthy();
  //   // expect(component.form.valid).toBeFalsy();

  //   component.form.controls['index'].setValue(0);
  //   expect(component.form.valid).toBeTruthy();
  //   expect(component.form.invalid).toBeFalsy();

  //   component.form.controls['index'].setValue(3);
  //   expect(component.form.valid).toBeTruthy();
  //   expect(component.form.invalid).toBeFalsy();
  // });

  // it('should display correctly data of column header text', () => {
  //   matSelector = fixture.debugElement.query(By.css('mat-select')).componentInstance;
  //   elements = matSelector.options.toArray();
  //   const dialogTitle = fixture.debugElement.query(By.css('.create-toolbar span'));
  //   const columnNameSelect = fixture.debugElement.query(By.css('.column-name-select'));
  //   let selectColumn = component.form.controls['columnName'];

  //   expect(dialogTitle.nativeElement).toBeTruthy();
  //   expect(dialogTitle.nativeElement.textContent).toEqual('create column');
  //   expect(columnNameSelect.nativeElement).toBeTruthy();

  //   expect(elements.length).toBe(2);
  //   expect(columnNameSelect.nativeElement).toBeTruthy();
  //   // NOTE: AND Verify that the mat select is displaying the default value!!
  //   expect(selectColumn.value).toEqual('Other'); // INFO: check that the form control contains the right value

  //   component.columnHeaderText = ['To Do', 'In Progress', 'Done', 'Other'];
  //   component.ngOnInit();
  //   fixture.detectChanges();
  //   selectColumn = component.form.controls['columnName'];
  //   elements = matSelector.options.toArray();
  //   expect(elements.length).toBe(4);
  //   expect(columnNameSelect.nativeElement).toBeTruthy();
  //   // NOTE: AND Verify that the mat select is displaying the default value!!
  //   expect(selectColumn.value).toEqual('To Do'); // INFO: check that the form control contains the right value
  //   // Switching between values of mat-select

  //   matSelector.selectionChange.subscribe(d => selectedCol.push(d.value));

  //   elements[0]._selectViaInteraction();
  //   elements[2]._selectViaInteraction();
  //   elements[1]._selectViaInteraction();
  //   elements[3]._selectViaInteraction();
  //   elements[2]._selectViaInteraction();

  //   expect(selectedCol.length).toBe(5);
  //   expect(selectedCol).toEqual(['To Do', 'Done', 'In Progress', 'Other', 'Done']);
  //   expect(selectColumn.value).toEqual('Done'); // INFO: check that the form control contains the right value
  // });

  // it('should have add and reset button', () => {
  //   const addButton = fixture.debugElement.query(By.css('.form-footer')).query(By.css('.add-button'));
  //   const resetButton = fixture.debugElement.query(By.css('.form-footer')).query(By.css('.reset-button'));

  //   expect(addButton.nativeElement).toBeTruthy();
  //   expect(addButton.nativeElement.textContent).toEqual('ADD');
  //   expect(resetButton.nativeElement).toBeTruthy();
  //   expect(resetButton.nativeElement.textContent).toEqual('RESET');

  //   component.form.controls['index'].setValue('');
  //   fixture.detectChanges();
  //   expect(addButton.nativeElement.getAttribute('disabled')).toEqual('true');

  //   component.form.controls['index'].setValue(0);
  //   fixture.detectChanges();
  //   expect(addButton.nativeElement.getAttribute('disabled')).toBeFalsy();
  // });

  // it('submitting a valid form', () => {
  //   matSelector = fixture.debugElement.query(By.css('mat-select')).componentInstance;
  //   elements = matSelector.options.toArray();
  //   const input = fixture.debugElement.query(By.css('.field-line-content input'));
  //   const selectColumn = component.form.controls['columnName'];
  //   const spy = spyOn(component, 'onClose').and.callThrough();

  //   matSelector.selectionChange.subscribe(d => selectedCol.push(d.value));

  //   elements[1]._selectViaInteraction();
  //   expect(selectColumn.value).toEqual('In Progress'); // INFO: check that the form control contains the right value

  //   input.nativeElement.value = 1;
  //   input.nativeElement.dispatchEvent(new Event('input'));
  //   fixture.detectChanges();

  //   expect(component.form.controls['index'].value).toEqual(1); // INFO: check that the form control contains the right value
  //   component.onSubmit();
  //   expect(spy).toHaveBeenCalled();
  //   expect(component.selectedKey).toEqual('InProgress');
  // });

  // it('should clear the form', () => {
  //   component.onClear();
  //   expect(component.form.controls['columnName'].value).toBe('');
  //   expect(component.form.controls['index'].value).toBe('');
  // });

  // it('should close the dialog', () => {
  //   const spy = spyOn(component.dialogRef, 'close').and.callThrough();
  //   expect(spy).toBeDefined();
  //   expect(component.dialogRef).toBeDefined();
  //   component.onClose();
  //   expect(spy).toHaveBeenCalled();
  // });
});
