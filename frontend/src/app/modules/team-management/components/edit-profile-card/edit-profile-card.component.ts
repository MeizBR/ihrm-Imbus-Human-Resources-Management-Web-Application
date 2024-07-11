import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

import { extractUserUpdatesFromForm, handleError, initializePassFormControls, initializeTeamFormGroup, teamForm } from '../../team-helpers';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { UserDetailedPermissions, UserForUpdate } from '../../../../shared/models';
import { ErrorType, setPasswordValidator, setPasswordValidatorOnSubmit } from '../../../../shared/validators/index';

@Component({
  selector: 'app-edit-profile-card',
  templateUrl: './edit-profile-card.component.html',
  styleUrls: ['./edit-profile-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileCardComponent implements OnChanges, OnDestroy {
  @Input() isOwnProfile: boolean;
  @Input() error: ErrorType | undefined;
  @Input() isAdministratorConnectedUser: boolean;
  @Input() editCardDetails: UserDetailedPermissions;

  @Output() onDeleteUser = new EventEmitter();
  @Output() updatedUser = new EventEmitter<UserForUpdate>();
  @Output() onSetGlobalRole = new EventEmitter<{ userId: number; roles: RoleModel[] }>();

  public form: FormGroup;
  public editPassword = false;
  public showPassword = false;
  public ErrorType = ErrorType;
  public showConfirmPassword = false;
  public showConnectedPassword = false;

  constructor() {
    this.form = teamForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editCardDetails'] && this.editCardDetails) {
      this.editPassword = false;
      initializeTeamFormGroup(this.editCardDetails);
      setPasswordValidator(this.form.controls['connectedPassword'], this.form.controls['password'], this.form.controls['confirmPassword']);
    }

    if (changes['error'] && this.error) {
      handleError(this.error, this.form);
    }
  }

  ngOnDestroy(): void {
    initializeTeamFormGroup();
  }

  public onSubmit(): void {
    const editedUser: UserForUpdate = extractUserUpdatesFromForm();
    setPasswordValidatorOnSubmit(this.form.controls['connectedPassword'], this.form.controls['password'], this.form.controls['confirmPassword']);

    if (this.form.valid && this.form.dirty) {
      this.updatedUser.emit(editedUser);
    }
  }

  public cancelEdit(): void {
    initializeTeamFormGroup(this.editCardDetails);
    if (this.editPassword) {
      this.togglePasswordFields();
    }
  }

  public togglePasswordFields(): void {
    this.editPassword = !this.editPassword;
    if (!this.editPassword) {
      this.showConnectedPassword = false;
      this.showPassword = false;
      this.showConfirmPassword = false;
      initializePassFormControls();
    }
  }

  public setGlobalRole(data: { userId: number; roles: RoleModel[] }): void {
    this.onSetGlobalRole.emit(data);
  }

  public deleteUser(): void {
    this.onDeleteUser.emit();
  }

  public contentChanged(event) {
    // NOTE: The length of event.text is initially 1, since it contains a trailing newline character, so replace function is needed
    if (event.text.replace(/\n$/, '').length && event.text.toString().trim().length === 0 && /\s/.test(event.text)) {
      this.form.controls['note'].setErrors({ [ErrorType.OnlyWhiteSpaces]: true });
    }
  }
}
