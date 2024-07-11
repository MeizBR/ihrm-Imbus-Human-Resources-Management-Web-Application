import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';

import { customersActions } from './customer.actions';

import { NotificationService } from '../../services/notification.service';
import { CustomersService } from '../../services/customers/customers.service';

import { BackendJsonError, ErrorType } from '../../../shared/validators/validation-error-type';
import { mapToPatchCustomer, mapToPostCustomer } from '../../../shared/models/customer-models/customer-info-data';

@Injectable()
export class CustomerEffects {
  loadCustomer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(customersActions.loadCustomersAction),
      switchMap(_ =>
        this.customersService.getCustomers().pipe(
          map(customers => customersActions.loadCustomersSuccessAction({ customersList: customers })),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(customersActions.customerManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  addCustomer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(customersActions.addCustomerAction),
      switchMap(action =>
        this.customersService.postCustomers(mapToPostCustomer(action.customer)).pipe(
          map(customer => {
            this.notificationService.success('Added successfully');

            return customersActions.addCustomerSuccessAction({ customer: customer });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 1002, // TODO: to be defined with the backend team
            };

            return of(
              customersActions.customerManagementFailAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.NameAlreadyExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  updateCustomer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(customersActions.updateCustomerAction),
      switchMap(action =>
        this.customersService.patchCustomers(mapToPatchCustomer(action.customer), action.id).pipe(
          map(customer => {
            this.notificationService.success('Updated successfully');

            return customersActions.updateCustomerSuccessAction({ customer: customer, id: customer.id });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 1002, // TODO: to be defined with the backend team
            };

            return of(customersActions.customerManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  deleteCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(customersActions.deleteCustomerAction),
      concatMap(action =>
        this.customersService.deleteCustomers(action.id).pipe(
          map(_ => {
            this.notificationService.success('Deleted successfully');
            if (this.router.url !== '/home/customers') {
              this.router.navigate(['home', 'customers']);
            }

            return customersActions.deleteCustomerSuccessAction({ id: action.id });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(customersActions.customerManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    ),
  );

  customerManagementFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(customersActions.customerManagementFailAction),
        tap(action => {
          if (action.withSnackBarNotification) {
            const msg = ErrorType.getErrorMessage({ [action.errorType]: true }, 'element');
            this.notificationService.warn(msg);
          }
        }),
      ),
    { dispatch: false },
  );

  constructor(private actions$: Actions, private customersService: CustomersService, private notificationService: NotificationService, private router: Router) {}
}
