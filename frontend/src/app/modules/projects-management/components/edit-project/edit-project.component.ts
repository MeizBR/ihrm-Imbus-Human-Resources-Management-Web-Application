import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

import { extractProjectUpdatesFromForm, projectsForm } from '../../project-helpers';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { CustomerDetails, mapToProjectForUpdate, ProjectDetailedPermissions, ProjectDetails, ProjectForUpdate } from '../../../../shared/models/index';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProjectComponent implements OnChanges, OnDestroy {
  @Input() projectDetails: ProjectDetailedPermissions;
  @Input() customersList: CustomerDetails[] | undefined;
  @Output() onDeleteProject = new EventEmitter<number>();
  @Output() updateProject = new EventEmitter<{ project: ProjectForUpdate }>();

  public form: FormGroup;
  public ErrorType = ErrorType;
  public selectedCustomer: CustomerDetails;

  constructor() {
    this.form = projectsForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectDetails'] && this.projectDetails) {
      this.selectedCustomer = this.customersList?.find(cal => cal?.id === this.projectDetails?.customerId);

      this.form.reset();
      this.form.patchValue({
        id: this.projectDetails?.id,
        customerId: this.projectDetails?.customerId,
        customer: this.projectDetails?.customer,
        name: this.projectDetails?.name,
        description: this.projectDetails?.description,
        isActive: this.projectDetails?.isActive,
      });
      // NOTE: Disabling text input doesn't work in html => To find another solution
      this.form.controls['customerId'].disable();
      if (!this.projectDetails?.userPermissions.canEdit) {
        this.form.controls['name'].disable();
      } else {
        this.form.controls['name'].enable();
      }
    }
  }

  ngOnDestroy(): void {
    this.form.reset({
      customerId: { value: '', disabled: false },
    });
  }

  public onClear(): void {
    this.form.reset();
    this.form.patchValue({
      id: this.projectDetails?.id,
      customerId: this.projectDetails?.customerId,
      customer: this.projectDetails?.customer,
      name: this.projectDetails?.name,
      description: this.projectDetails?.description,
      isActive: this.projectDetails?.isActive,
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const updatedProjectDetails: ProjectDetails = extractProjectUpdatesFromForm();
      const projectForUpdate: ProjectForUpdate = mapToProjectForUpdate(updatedProjectDetails);
      this.updateProject.emit({ project: projectForUpdate });
    }
  }

  public deleteProject(): void {
    this.onDeleteProject.emit(this.projectDetails.id);
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }

  public customerTrackFn = (i: number, _: CustomerDetails) => i;
}
