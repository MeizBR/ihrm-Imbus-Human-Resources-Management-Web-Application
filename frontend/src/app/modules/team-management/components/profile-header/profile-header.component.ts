import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { getConfirmSettingRoleMessage, getConfirmSettingRoleTitle, getGlobalRoles } from '../../team-helpers';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { ConfirmDialogModel, UserDetailedPermissions } from '../../../../shared/models/index';
import { ConfirmDialogComponent } from '../../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss'],
})
export class ProfileHeaderComponent implements OnChanges {
  @Input() isOwnProfile: boolean;
  @Input() cardDetails: UserDetailedPermissions;
  @Input() isAdministratorConnectedUser: boolean;
  @Output() onDeleteUser = new EventEmitter();
  @Output() onSetRole = new EventEmitter<{ userId: number; roles: RoleModel[] }>();

  public isActiveUser: boolean;
  public isAdministrator: boolean;
  public isAccountManager: boolean;

  constructor(public dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardDetails'] && this.cardDetails) {
      this.isActiveUser = this.cardDetails?.isActive;
      this.isAdministrator = this.cardDetails?.globalRoles?.includes(RoleModel.Administrator);
      this.isAccountManager = this.cardDetails?.globalRoles?.includes(RoleModel.AccountManager);
    }
  }

  public onChangeRole(event: MatSlideToggleChange) {
    // NOTE: To prevent the slide from switching before confirmation
    // NOTE: Assigning the opposite of event.checked instead causes slide switching issues, that's why we do it this way
    event.source.checked = event?.source?.id === 'administrator' ? this.isAdministrator : this.isAccountManager;

    const data: ConfirmDialogModel = {
      title: getConfirmSettingRoleTitle(event?.source?.id, this.isAdministrator, this.isAccountManager),
      message: getConfirmSettingRoleMessage(event?.source?.id, this.isAdministrator, this.isAccountManager),
      value: this.cardDetails.fullName,
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });
    const subscribeDialog = dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.isAdministrator = event?.source?.id === 'administrator' ? !this.isAdministrator : this.isAdministrator;
        this.isAccountManager = event?.source?.id === 'accountManager' ? !this.isAccountManager : this.isAccountManager;

        this.onSetRole.emit({
          userId: this.cardDetails.id,
          roles: getGlobalRoles(event?.source?.id, this.cardDetails, this.isAdministrator, this.isAccountManager),
        });
      }
    });
    dialogRef.afterClosed().subscribe(_ => subscribeDialog.unsubscribe());
  }

  public deleteUser() {
    this.onDeleteUser.emit();
  }
}
