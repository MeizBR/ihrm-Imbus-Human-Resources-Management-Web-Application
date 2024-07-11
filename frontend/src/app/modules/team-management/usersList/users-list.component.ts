import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { usersActions } from '../../../core/reducers/user/user.actions';
import { settingsActions } from '../../../core/reducers/settings/settings.actions';
import { getModulePageSize } from '../../../core/reducers/settings/settings.selectors';
import { IHRMAppModules, ModulesPagesSizes } from '../../../core/reducers/settings/settings.reducer';
import { getUsersError, getUsersLoading, selectAddUserPermission, usersListDetailed } from '../../../core/reducers/user';

import { displayedTeamColumns, getConfirmDeleteUserMessage, teamColumns } from '../team-helpers';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { sortingDataAccessor } from '../../../shared/helpers/sorting-data.helper';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogModel, UserDetailedPermissions, UserDetails, UserForAdd } from '../../../shared/models/index';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit, OnDestroy {
  private subscription$: Subscription[] = [];
  private usersDetails: UserDetailedPermissions[];

  public addPermitted = false;
  public columns = teamColumns;
  public displayedColumns = displayedTeamColumns;
  public error$: Observable<ErrorType | undefined>;
  public usersPageSize$: Observable<ModulesPagesSizes>;
  public isUsersLoading$: Observable<boolean | undefined>;
  public teamList: MatTableDataSource<UserDetailedPermissions> = new MatTableDataSource([]);

  constructor(private store: Store<AppState>, public dialog: MatDialog) {
    this.error$ = this.store.pipe(select(getUsersError));
    this.isUsersLoading$ = this.store.pipe(select(getUsersLoading));
    this.subscription$.push(
      this.store.pipe(select(usersListDetailed)).subscribe(users => {
        this.usersDetails = users;
        this.teamList = new MatTableDataSource(users);
        this.teamList.sortingDataAccessor = (data: UserDetails, sortHeaderId: string): string => sortingDataAccessor(data, sortHeaderId);
      }),
    );

    this.usersPageSize$ = this.store.pipe(select(getModulePageSize(IHRMAppModules.Users)));
  }

  ngOnInit(): void {
    this.teamList = new MatTableDataSource(this.usersDetails);
    this.store.pipe(select(selectAddUserPermission)).subscribe(permission => (this.addPermitted = permission));
  }

  ngOnDestroy(): void {
    this.subscription$.forEach(item => item.unsubscribe());
  }

  public onCreate(newUser: UserForAdd): void {
    this.store.dispatch(usersActions.addUserAction({ user: newUser }));
  }

  public onDelete(id: number): void {
    const data: ConfirmDialogModel = {
      title: 'DELETE_TITLE',
      message: getConfirmDeleteUserMessage(
        this.usersDetails.find(user => user.id === id)?.globalRoles?.includes(RoleModel.Administrator),
        this.usersDetails.find(user => user.id === id)?.globalRoles?.includes(RoleModel.AccountManager),
      ),
      value: this.usersDetails.find(user => user.id === id)?.fullName,
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });
    const subscribeDialog = dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.store.dispatch(usersActions.deleteUserAction({ id: id }));
      }
    });
    dialogRef.afterClosed().subscribe(_ => subscribeDialog.unsubscribe());
  }

  public onChangePageSize(event: { pageSize: number }): void {
    this.store.dispatch(settingsActions.updateModulePageSizeAction({ pageSize: { module: IHRMAppModules.Users, size: event.pageSize } }));
  }
}
