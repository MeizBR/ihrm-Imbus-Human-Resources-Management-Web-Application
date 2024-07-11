import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { combineLatest, Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { selectProjectsList } from '../../../core/reducers/project';
import { customersActions } from '../../../core/reducers/customer/customer.actions';
import { customersListDetailed, getCustomersError } from '../../../core/reducers/customer';

import { ErrorType } from '../../../shared/validators/validation-error-type';
import { ConfirmDialogModel, CustomerForUpdate, ProjectDetails } from '../../../shared/models';
import { CustomerDetailedPermissions } from '../../../shared/models/customer-models/customerDetails';
import { WarningDialogComponent } from '../../../shared/component/warning-dialog/warning-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss'],
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
  private projects: ProjectDetails[];
  private subscriptions$: Subscription[] = [];

  public customerFromUrl: number;
  public error$: Observable<ErrorType | undefined>;
  public allCustomers: CustomerDetailedPermissions[];
  public customerDetails: CustomerDetailedPermissions;

  constructor(public dialog: MatDialog, private store: Store<AppState>, private route: ActivatedRoute) {
    this.error$ = this.store.pipe(select(getCustomersError));
    this.subscriptions$.push(this.store.pipe(select(selectProjectsList)).subscribe(projects => (this.projects = projects)));
  }

  ngOnInit(): void {
    this.subscriptions$.push(
      combineLatest([this.route.params, this.store.pipe(select(customersListDetailed))]).subscribe(([customerFromUrl, customers]) => {
        this.customerFromUrl = parseInt(customerFromUrl.customerId, 10);
        this.customerDetails = customers?.find(customer => customer?.id === +customerFromUrl.customerId);
        this.allCustomers = customers;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions$.map(subscription => subscription.unsubscribe);
  }

  public updateCustomer(customerToUpdate: CustomerForUpdate): void {
    this.store.dispatch(customersActions.updateCustomerAction({ customer: customerToUpdate, id: +this.customerFromUrl }));
  }

  public deleteCustomer(id: number): void {
    if (this.projects.find((project: ProjectDetails) => project.customerId === id)) {
      const data: ConfirmDialogModel = { message: 'CUSTOMER_DELETE_WARNING_MESSAGE' };
      this.dialog.open(WarningDialogComponent, { maxWidth: '600px', data });
    } else {
      const data: ConfirmDialogModel = { title: 'DELETE_TITLE', message: 'DELETE_MESSAGE' };
      const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '600px', data });
      const subscribeDialog = dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult === true) {
          this.store.dispatch(customersActions.deleteCustomerAction({ id }));
        }
      });
      dialogRef.afterClosed().subscribe(_ => subscribeDialog.unsubscribe());
    }
  }
}
