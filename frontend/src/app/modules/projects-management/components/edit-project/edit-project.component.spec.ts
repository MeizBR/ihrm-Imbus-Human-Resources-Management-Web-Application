import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { QuillModule } from 'ngx-quill';

import { EditProjectComponent } from './edit-project.component';

import { ErrorType, trimmedValidator } from '../../../../shared/validators/index';
import { CustomerDetails, ProjectDetailedPermissions } from '../../../../shared/models/index';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('Edit Project Component', () => {
  let component: EditProjectComponent;
  let fixture: ComponentFixture<EditProjectComponent>;
  let customerSelect: MatSelect;
  let elements: MatOption[];
  let selectedCol = [];

  const projectDetails: ProjectDetailedPermissions = {
    id: 1,
    customerId: 1,
    customer: 'Customer N°1',
    name: 'Project A1',
    description: 'Description of Project A1',
    note: '',
    isActive: true,
    userRoles: ['Lead'],
    userPermissions: {
      canEdit: true,
      seeRoles: true,
      canDelete: true,
      canEditRole: true,
    },
  };
  const customersList: CustomerDetails[] = [
    {
      id: 1,
      name: 'Customer N°1',
      description: 'Description of Customer N°1',
      isActive: true,
    },
    {
      id: 2,
      name: 'Customer N°2',
      description: 'Description of Customer N°1',
      isActive: false,
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditProjectComponent],
      imports: [AngularMaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), QuillModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProjectComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      id: new FormControl(''),
      customerId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), trimmedValidator]),
      description: new FormControl('', Validators.required),
      isActive: new FormControl(false),
    });
    component.projectDetails = projectDetails;
    component.customersList = customersList;
    selectedCol = [];
    elements = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the header card correctly', () => {
    const cardHeaderText = fixture.debugElement.query(By.css('.project-container .project-card .card-header-text'));
    const cardTitle = fixture.debugElement.query(By.css('.project-container .project-card .card-header-text .card-title'));

    expect(cardHeaderText).toBeTruthy();
    expect(cardTitle).toBeTruthy();
    expect(cardTitle.nativeElement.textContent).toEqual('PROJECTS_VIEW.EDIT_PROJECT.PROJECT_DETAILS');

    component.projectDetails = { ...projectDetails, userPermissions: { ...projectDetails.userPermissions, canEdit: false } };
    component.ngOnChanges({ projectDetails: new SimpleChange(projectDetails, undefined, true) });
    fixture.detectChanges();

    const lockIcon = fixture.debugElement.query(By.css('.buttons-section .lock-icon'));
    expect(lockIcon).toBeTruthy();
    expect(lockIcon.nativeElement.textContent).toEqual('lock');

    component.projectDetails = { ...projectDetails, userPermissions: { ...projectDetails.userPermissions, canDelete: true } };
    component.ngOnChanges({ projectDetails: new SimpleChange(projectDetails, undefined, true) });
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(By.css('.buttons-section .delete-button'));
    expect(deleteButton).toBeTruthy();
    expect(deleteButton.nativeElement.textContent).toEqual('delete');
  });

  it('should display the detailed project inputs correctly', () => {
    component.projectDetails = projectDetails;
    fixture.detectChanges();

    const cardContent = fixture.debugElement.query(By.css('.card-content'));
    const editProjectFormDiv = fixture.debugElement.query(By.css('.edit-project-form'));
    const editProjectForm = fixture.debugElement.query(By.css('.edit-project'));
    const editProjectData = fixture.debugElement.query(By.css('.edit-project-data'));
    expect(cardContent).toBeTruthy();
    expect(editProjectFormDiv).toBeTruthy();
    expect(editProjectForm).toBeTruthy();
    expect(editProjectData).toBeTruthy();
    expect(editProjectForm.nativeElement.childElementCount).toEqual(2);
    expect(editProjectData.nativeElement.childElementCount).toEqual(2);

    // Information section
    const informationContainer = fixture.debugElement.query(By.css('.information-section'));
    expect(informationContainer).toBeTruthy();

    const customerLabel = fixture.debugElement.query(By.css('[data-test=customer_label]'));
    expect(customerLabel).toBeTruthy();

    expect(customerLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.CUSTOMER_NAME');

    customerSelect = fixture.debugElement.query(By.css('[formControlName=customerId]')).componentInstance;
    expect(customerSelect).toBeTruthy();

    elements = customerSelect.options.toArray();
    expect(elements.length).toBe(2);

    customerSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[1]._selectViaInteraction();
    elements[0]._selectViaInteraction();

    expect(selectedCol.length).toBe(2);
    expect(selectedCol).toEqual([2, 1]);

    const projectNameLabel = fixture.debugElement.query(By.css('[data-test=name_label]'));
    expect(projectNameLabel).toBeTruthy();
    expect(projectNameLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.PROJECT_NAME');

    const projectNameInput = fixture.debugElement.query(By.css('[formControlName=name]'));
    expect(projectNameInput).toBeTruthy();

    let isActiveSection = fixture.debugElement.query(By.css('.is-active-section'));
    expect(isActiveSection).toBeTruthy();

    const isActiveFieldLabel = fixture.debugElement.query(By.css('[data-test=is_active_label]'));
    expect(isActiveFieldLabel).toBeTruthy();
    expect(isActiveFieldLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.ACTIVE');

    let isActiveField = fixture.debugElement.query(By.css('[formControlName=isActive]'));
    expect(isActiveField).toBeTruthy();
    expect(isActiveField.componentInstance.disabled).toEqual(false);

    // description section
    const descriptionSection = fixture.debugElement.query(By.css('.description-section'));
    expect(descriptionSection).toBeTruthy();

    const descriptionLabel = fixture.debugElement.query(By.css('.description-label'));
    expect(descriptionLabel).toBeTruthy();
    expect(descriptionLabel.nativeElement.textContent).toEqual('PROJECTS_VIEW.DESCRIPTION:');

    let descriptionRichText = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionRichText).toBeTruthy();

    // actions section
    let actionsSection = fixture.debugElement.query(By.css('.actions-section'));
    expect(actionsSection).toBeTruthy();
    expect(actionsSection.nativeElement.childElementCount).toEqual(2);

    const submitButton = fixture.debugElement.query(By.css('.submit-button'));

    expect(submitButton).toBeTruthy();
    expect(submitButton.nativeElement.disabled).toEqual(true);

    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    expect(cancelButton).toBeTruthy();
    expect(cancelButton.nativeElement.disabled).toEqual(true);

    component.projectDetails = { ...projectDetails, userPermissions: { ...projectDetails.userPermissions, canEdit: false } };
    fixture.detectChanges();

    // Information section
    customerSelect = fixture.debugElement.query(By.css('[formControlName=customerId]')).componentInstance;
    expect(customerSelect).toBeTruthy();

    component.projectDetails = {
      ...projectDetails,
      customerId: 2,
      customer: 'Customer N°2',
      userPermissions: { ...projectDetails.userPermissions, canEdit: false },
    };
    component.ngOnChanges({ projectDetails: new SimpleChange(projectDetails, undefined, true) });
    fixture.detectChanges();

    customerSelect = fixture.debugElement.query(By.css('[formControlName=customerId]')).componentInstance;
    expect(customerSelect).toBeTruthy();

    isActiveSection = fixture.debugElement.query(By.css('.is-active-section'));
    expect(isActiveSection).toBeTruthy();
    expect(isActiveSection.classes['disabled-is_active-field']).toEqual(true);

    isActiveField = fixture.debugElement.query(By.css('[formControlName=isActive]'));
    expect(isActiveField).toBeTruthy();
    expect(isActiveField.componentInstance.disabled).toEqual(true);

    // description section
    descriptionRichText = fixture.debugElement.query(By.css('[formControlName=description]'));
    expect(descriptionRichText).toBeTruthy();
    expect(descriptionRichText.componentInstance.readOnly).toEqual(true);
    expect(descriptionRichText.classes['disabled-description-field']).toEqual(true);

    // actions section
    actionsSection = fixture.debugElement.query(By.css('.actions-section'));
    expect(actionsSection).toBeFalsy();
  });

  it('validator should work correctly', () => {
    // Customer validator
    let control = component.form.get('customerId');

    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    // Project name validator
    control = component.form.get('name');
    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);

    control.setValue(
      `isName_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_
      very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_very_long`,
    );
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Maxlength)).toBe(true);
    expect(control.errors[ErrorType.Maxlength].requiredLength).toEqual(255);
    expect(ErrorType.getErrorMessage(control.errors, 'Name')).toEqual('Name is too long, max of 255 characters are allowed.');

    control.setValue('na');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Minlength)).toBe(true);
    expect(control.errors[ErrorType.Minlength].requiredLength).toEqual(3);
    expect(ErrorType.getErrorMessage(control.errors, 'Name')).toEqual('Minimum of 3 characters are required.');

    control.setValue(' Project A1 ');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.NotTrimmed)).toBe(true);
    expect(ErrorType.getErrorMessage(control.errors)).toEqual('Leading or trailing white spaces are not allowed.');

    // Description validator
    control = component.form.get('description');
    control.setValue('');
    expect(control.valid).toEqual(false);
    expect(control.hasError(ErrorType.Required)).toBe(true);
  });

  it('should update the project details related to form data', () => {
    customerSelect = fixture.debugElement.query(By.css('[formControlName=customerId]')).componentInstance;

    const nameInput = fixture.debugElement.query(By.css('[formControlName=name]'));
    const descriptionInput = fixture.debugElement.query(By.css('[formControlName=description]'));
    const form = fixture.debugElement.query(By.css('form'));
    const saveButton = fixture.debugElement.query(By.css('.submit-button'));
    const cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
    const spyOnSubmit = spyOn(component, 'onSubmit').and.callThrough();
    const spyOnUpdatedProject = spyOn(component.updateProject, 'emit').and.callThrough();
    const spyOnCancelEdit = spyOn(component, 'onClear').and.callThrough();

    component.projectDetails = projectDetails;
    component.ngOnChanges({ projectDetails: new SimpleChange(projectDetails, undefined, true) });
    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.dirty).toEqual(false);
    expect(component.form.controls['customerId'].value).toEqual(1);
    expect(component.form.controls['name'].value).toEqual('Project A1');
    expect(component.form.controls['description'].value).toEqual('Description of Project A1');
    expect(component.form.controls['isActive'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeTruthy();
    expect(cancelButton.properties.disabled).toBeTruthy();

    elements = customerSelect.options.toArray();
    customerSelect.selectionChange.subscribe(d => selectedCol.push(d.value));

    elements[1]._selectViaInteraction();

    nameInput.nativeElement.value = 'Project A1 updated';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    nameInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.patchValue({ name: 'Project A1 updated' });

    descriptionInput.nativeElement.value = 'Description of Project A1 updated';
    descriptionInput.nativeElement.dispatchEvent(new Event('change'));
    descriptionInput.nativeElement.dispatchEvent(new Event('blur'));
    component.form.patchValue({ description: 'Description of Project A1 updated' });
    component.form.markAsDirty();

    fixture.detectChanges();

    expect(component.form.valid).toEqual(true);
    expect(component.form.controls['customerId'].value).toEqual(2);
    expect(component.form.controls['name'].value).toEqual('Project A1 updated');
    expect(component.form.controls['description'].value).toEqual('Description of Project A1 updated');
    expect(component.form.controls['isActive'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeFalsy();
    expect(cancelButton.properties.disabled).toBeFalsy();

    // NOTE: use triggerEventHandler instead of simple click to avoid test reloading
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();

    expect(spyOnSubmit).toHaveBeenCalled();
    expect(component.form.valid).toEqual(true);
    expect(spyOnUpdatedProject).toHaveBeenCalled();

    cancelButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(spyOnCancelEdit).toHaveBeenCalled();
    expect(component.form.controls['customerId'].value).toEqual(1);
    expect(component.form.controls['name'].value).toEqual('Project A1');
    expect(component.form.controls['description'].value).toEqual('Description of Project A1');
    expect(component.form.controls['isActive'].value).toEqual(true);
    expect(saveButton.properties.disabled).toBeTruthy();
    expect(cancelButton.properties.disabled).toBeTruthy();
  });
});
