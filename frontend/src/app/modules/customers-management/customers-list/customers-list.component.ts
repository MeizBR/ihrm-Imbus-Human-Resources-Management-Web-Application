import { Router } from '@angular/router';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { selectProjectsList } from '../../../core/reducers/project';
import { getModulePageSize } from '../../../core/reducers/settings/settings.selectors';
import { IHRMAppModules, ModulesPagesSizes } from '../../../core/reducers/settings/settings.reducer';
import { customersListDetailed, getCustomersError, getCustomersLoading, selectAddCustomerPermission } from '../../../core/reducers/customer';

import { customersActions } from '../../../core/reducers/customer/customer.actions';
import { settingsActions } from '../../../core/reducers/settings/settings.actions';

import { sortingDataAccessor } from '../../../shared/helpers/sorting-data.helper';
import { customersColumns, displayedCustomerColumns } from '../customer-helpers';

import { ErrorType } from '../../../shared/validators/validation-error-type';
import { WarningDialogComponent } from '../../../shared/component/warning-dialog/warning-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogModel, CustomerDetailedPermissions, CustomerDetails, CustomerForAdd, ProjectDetails } from '../../../shared/models/index';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss'],
})
export class CustomersListComponent implements OnDestroy {
  private projects: ProjectDetails[];
  private subscription$: Subscription[] = [];

  public addPermitted = false;
  public columns = customersColumns;
  public error$: Observable<ErrorType | undefined>;
  public displayedColumns = displayedCustomerColumns;
  public customersPageSize$: Observable<ModulesPagesSizes>;
  public isCustomersLoading$: Observable<boolean | undefined>;
  public customerList: MatTableDataSource<CustomerDetailedPermissions> = new MatTableDataSource([]);

  constructor(private dialog: MatDialog, private store: Store<AppState>, private router: Router) {
    this.error$ = this.store.pipe(select(getCustomersError));
    this.isCustomersLoading$ = this.store.pipe(select(getCustomersLoading));
    this.subscription$.push(
      this.store.pipe(select(selectAddCustomerPermission)).subscribe(permission => (this.addPermitted = permission)),
      this.store.pipe(select(customersListDetailed)).subscribe((customers: CustomerDetailedPermissions[]) => {
        this.customerList.data = customers;
        this.customerList = new MatTableDataSource(customers);
        this.customerList.sortingDataAccessor = (data: CustomerDetailedPermissions, sortHeaderId: string): string => sortingDataAccessor(data, sortHeaderId);
      }),
      this.store.pipe(select(selectProjectsList)).subscribe(projects => (this.projects = projects)),
      this.store.pipe(select(selectAddCustomerPermission)).subscribe(permission => (this.addPermitted = permission)),
    );
    this.customersPageSize$ = this.store.pipe(select(getModulePageSize(IHRMAppModules.Customers)));
  }

  ngOnDestroy(): void {
    this.subscription$.forEach(item => item.unsubscribe());
  }

  public onAddCustomer(customerForAdd: CustomerForAdd): void {
    this.store.dispatch(customersActions.addCustomerAction({ customer: customerForAdd }));
  }

  public onEditCustomer(row: CustomerDetails): void {
    this.router.navigate(['home/customers/details/', row.id]);
  }

  public onDeleteCustomer(id: number): void {
    // NOTE: new feature could be added here, displaying list of project of custom (similar to user roles in project)
    if (this.projects?.find((project: ProjectDetails) => project?.customerId === id)) {
      const data: ConfirmDialogModel = { message: 'CUSTOMER_DELETE_WARNING_MESSAGE' };
      this.dialog.open(WarningDialogComponent, { maxWidth: '600px', data });
    } else {
      const data: ConfirmDialogModel = { title: 'DELETE_TITLE', message: 'DELETE_MESSAGE' };
      const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '600px', data });
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult === true) {
          this.store.dispatch(customersActions.deleteCustomerAction({ id: id }));
        }
      });
    }
  }

  public onChangePageSize(event: { pageSize: number }): void {
    this.store.dispatch(settingsActions.updateModulePageSizeAction({ pageSize: { module: IHRMAppModules.Customers, size: event.pageSize } }));
  }
}
