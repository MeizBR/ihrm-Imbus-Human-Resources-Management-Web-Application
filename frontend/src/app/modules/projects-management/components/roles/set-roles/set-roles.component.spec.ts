import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { SetRolesComponent } from './set-roles.component';

import { SelectBoxItems } from '../../../../../shared/models';
import { ErrorType } from '../../../../../shared/validators/validation-error-type';
import { AngularMaterialModule } from '../../../../../shared/angular-material/angular-material.module';

describe('SetRolesComponent', () => {
  let component: SetRolesComponent;
  let fixture: ComponentFixture<SetRolesComponent>;

  let userSelect: MatSelect;
  let elements: MatOption[];
  let selectedCol = [];
  const usersToSelect: SelectBoxItems[] = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'lead' },
  ];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, TranslateModule.forRoot()],
      declarations: [SetRolesComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetRolesComponent);
    component = fixture.componentInstance;
    component.formVisibility = false;
    component.usersToSelect = usersToSelect;
    component.form = new FormGroup({
      user: new FormControl('', Validators.required),
      selectedRoles: new FormControl([], Validators.required),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the set role button correctly', () => {
    component.formVisibility = false;
    component.usersToSelect = [];
    fixture.detectChanges();

    const setRoleContainer = fixture.debugElement.query(By.css('.container'));
    expect(setRoleContainer).toBeTruthy();

    const setRoleButton = fixture.debugElement.query(By.css('.container button'));
    expect(setRoleButton).toBeTruthy();
    expect(setRoleButton.properties.disabled).toEqual(true);

    component.usersToSelect = usersToSelect;
    fixture.detectChanges();

    expect(setRoleButton.properties.disabled).toEqual(false);

    setRoleButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.formVisibility).toEqual(true);
  });

  it('should display the form data correctly', () => {
    selectedCol = [];
    component.formVisibility = false;
    fixture.detectChanges();

    let setRoleForm = fixture.debugElement.query(By.css('.container form'));
    expect(setRoleForm).toBeFalsy();

    component.formVisibility = true;
    fixture.detectChanges();

    setRoleForm = fixture.debugElement.query(By.css('.container form'));
    expect(setRoleForm).toBeTruthy();
    expect(setRoleForm.nativeElement.childElementCount).toEqual(3);

    const userField = fixture.debugElement.query(By.css('.user-field'));
    expect(userField).toBeTruthy();

    const userLabel = fixture.debugElement.query(By.css('[data-test=user_label]'));
    expect(userLabel).toBeTruthy();
    expect(userLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.ROLES.SELECT_USER');

    userSelect = fixture.debugElement.query(By.css('[formControlName=user]')).componentInstance;
    expect(userSelect).toBeTruthy();
    expect(userSelect.disabled).toEqual(false);
    expect(userSelect.placeholder).toEqual('Select user ...');

    elements = userSelect.options.toArray();

    expect(elements.length).toBe(2);

    userSelect.selectionChange.subscribe(d => selectedCol.push(d.value));
    elements[1]._selectViaInteraction();
    elements[0]._selectViaInteraction();

    expect(selectedCol.length).toBe(2);
    expect(selectedCol).toEqual([usersToSelect[1], usersToSelect[0]]);

    const buttonsContainer = fixture.debugElement.query(By.css('.buttons-container'));
    expect(buttonsContainer).toBeTruthy();
    expect(buttonsContainer.nativeElement.childElementCount).toEqual(2);

    const submitButton = fixture.debugElement.query(By.css('.submit-button'));
    expect(submitButton).toBeTruthy();
    expect(submitButton.properties.disabled).toEqual(true);
    expect(submitButton.nativeElement.textContent).toEqual('ADD');

    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    expect(cancelButton).toBeTruthy();
    expect(cancelButton.nativeElement.textContent).toEqual('CANCEL');
  });

  it('validator should work correctly', () => {
    // User validator
    let control = component.form.get('user');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    // Selected Roles validator
    control = component.form.get('selectedRoles');
    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);
  });

  it('action submit button should work correctly', () => {
    component.formVisibility = true;
    component.form.controls['user'].setValue('admin');
    component.form.controls['selectedRoles'].setValue(['Lead', 'Member']);
    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.controls['user'].value).toEqual('admin');
    expect(component.form.controls['selectedRoles'].value).toEqual(['Lead', 'Member']);

    const form = fixture.debugElement.query(By.css('form'));
    const submitButton = fixture.debugElement.query(By.css('.submit-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit').and.callThrough();
    const spyOnUserRoleToAdd = spyOn(component.userRoleToAdd, 'emit').and.callThrough();

    expect(submitButton).toBeTruthy();

    form.triggerEventHandler('submit', null);
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();
    expect(spyOnUserRoleToAdd).toHaveBeenCalled();
    expect(component.formVisibility).toEqual(false);
  });

  it('action cancel button should work correctly', () => {
    component.formVisibility = true;
    component.form.controls['user'].setValue('admin');
    component.form.controls['selectedRoles'].setValue(['Lead', 'Member']);
    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.controls['user'].value).toEqual('admin');
    expect(component.form.controls['selectedRoles'].value).toEqual(['Lead', 'Member']);

    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnCancel = spyOn(component, 'cancel').and.callThrough();

    cancelButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(spyOnCancel).toHaveBeenCalled();
    expect(component.formVisibility).toEqual(false);
  });
});
