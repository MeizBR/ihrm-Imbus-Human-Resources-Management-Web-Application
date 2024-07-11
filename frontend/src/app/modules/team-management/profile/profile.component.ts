import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { combineLatest, Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { isAdminGlobalRole, loggedUserId } from '../../../core/reducers/auth/index';
import { usersActions } from '../../../core/reducers/user/user.actions';
import { getUsersError, usersListDetailed } from '../../../core/reducers/user';

import { getConfirmDeleteUserMessage } from '../team-helpers';
import { ImgPath } from '../../../../assets/img/img-path-config';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { ConfirmDialogModel, UserDetailedPermissions, UserForUpdate } from '../../../shared/models/index';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private subscriptions$: Subscription[] = [];

  public userFromUrl: number;
  public imgPath = ImgPath;
  public isOwnProfile: boolean;
  public allUsers: UserDetailedPermissions[];
  public userDetails: UserDetailedPermissions;
  public error$: Observable<ErrorType | undefined>;
  public isAdministrator$: Observable<boolean | undefined>;

  constructor(public dialog: MatDialog, private store: Store<AppState>, private route: ActivatedRoute) {
    this.error$ = this.store.pipe(select(getUsersError));
  }

  ngOnInit(): void {
    this.subscriptions$.push(
      combineLatest([this.route.params, this.store.pipe(select(loggedUserId)), this.store.pipe(select(usersListDetailed))]).subscribe(([userId, userOwnId, users]) => {
        this.userFromUrl = parseInt(userId?.profileId, 10);
        this.userDetails = users?.find(user => user?.id === +userId?.profileId);
        this.allUsers = users;
        this.isOwnProfile = userOwnId === this.userFromUrl;
      }),
    );
    this.isAdministrator$ = this.store.pipe(select(isAdminGlobalRole));
  }

  ngOnDestroy(): void {
    this.subscriptions$.map(subscription => subscription.unsubscribe);
  }

  public updateUser(us: UserForUpdate): void {
    this.store.dispatch(usersActions.updateUserAction({ user: us }));
  }

  public setRoles(data: { userId: number; roles: RoleModel[] }): void {
    this.store.dispatch(usersActions.putUserRoleAction({ id: data.userId, roles: data.roles.map(role => RoleModel.toApiValue(role)) }));
  }

  public deleteUser(): void {
    const data: ConfirmDialogModel = {
      title: 'DELETE_TITLE',
      message: getConfirmDeleteUserMessage(this.userDetails.globalRoles?.includes(RoleModel.Administrator), this.userDetails.globalRoles?.includes(RoleModel.AccountManager)),
      value: this.userDetails.fullName,
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });
    const subscribeDialog = dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.store.dispatch(usersActions.deleteUserAction({ id: this.userDetails.id }));
      }
    });
    dialogRef.afterClosed().subscribe(_ => subscribeDialog.unsubscribe());
  }
}
