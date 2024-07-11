import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

import { initializeProjectFormGroup, projectsForm } from '../../project-helpers';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProjectForAdd } from '../../../../shared/models/project-models/project-info-data';
import { CustomerDetails } from '../../../../shared/models/customer-models/customerDetails';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
})
export class AddProjectComponent implements OnInit, OnChanges {
  @Input() error: ErrorType | undefined;
  @Input() isProjectsLoading: boolean | undefined;
  @Output() onAdd = new EventEmitter<ProjectForAdd>();
  @Input() customersList: CustomerDetails[] | undefined;

  public ErrorType = ErrorType;
  public formVisibility = false;
  public addProjectForm: FormGroup;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.addProjectForm = projectsForm;
  }

  ngOnChanges(): void {
    if (!this.error && !this.isProjectsLoading) {
      this.close();
    } else {
      this.handleError(this.error);
    }
  }

  public close(): void {
    this.formVisibility = false;
    this.resetAddProjectForm();
  }

  public openForm(): void {
    if (!!this.customersList?.length) {
      this.formVisibility = true;
    } else {
      this.notificationService.warn('No customers available !');
    }
  }

  public onSubmit(): void {
    if (this.addProjectForm.valid) {
      this.onAdd.emit({
        customerId: this.addProjectForm.controls['customerId'].value,
        name: this.addProjectForm.controls['name'].value,
        description: this.addProjectForm.controls['description'].value,
        isActive: this.addProjectForm.controls['isActive'].value,
      });
    }
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.addProjectForm.controls['description'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }

  public customerTrackFn = (i: number, _: CustomerDetails) => i;

  private resetAddProjectForm(): void {
    this.addProjectForm?.reset();
    initializeProjectFormGroup();
  }

  private handleError(errorType: ErrorType | undefined): void {
    if (errorType === ErrorType.NameAlreadyExists) {
      this.addProjectForm.controls['name'].setErrors({ [ErrorType.NameAlreadyExists]: true });
    }
  }
}
