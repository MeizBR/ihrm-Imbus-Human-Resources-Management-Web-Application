import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs';

import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { cold, hot } from 'jasmine-marbles';

import { reducers } from '../..';
import { CustomerEffects } from '../customer.effects';
import { customersActions } from '../customer.actions';

import { NotificationService } from '../../../services/notification.service';
import { CustomersService } from '../../../services/customers/customers.service';

import { CustomerDetails } from '../../../../shared/models/customer-models/customerDetails';
import { BackendJsonError, ErrorType } from '../../../../shared/validators/validation-error-type';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';
import { CustomerForAdd, CustomerForUpdate } from '../../../../shared/models/customer-models/customer-info-data';
import { CustomersListComponent } from '../../../../modules/customers-management/customers-list/customers-list.component';

describe('Customers Effects', () => {
  // tslint:disable:no-any
  let actions: Observable<any>;
  let effects: CustomerEffects;
  let customersService: jasmine.SpyObj<CustomersService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        AngularMaterialModule,
        RouterTestingModule.withRoutes([{ path: 'home/customers', component: CustomersListComponent }]),
      ],
      providers: [
        CustomerEffects,
        provideMockActions(() => actions),
        { provide: NotificationService, useValue: { success: () => {}, warn: () => {} } },
        { provide: CustomersService, useValue: jasmine.createSpyObj('customersService', ['getCustomers', 'postCustomers', 'patchCustomers', 'deleteCustomers']) },
      ],
    });
    effects = TestBed.inject(CustomerEffects);
    customersService = TestBed.inject(CustomersService) as jasmine.SpyObj<CustomersService>;
  });

  describe('load customers list', () => {
    it('should return a stream with loadCustomersSuccessAction action', () => {
      const customersList: CustomerDetails[] = [{ id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true }];
      const action = customersActions.loadCustomersAction();
      const outcome = customersActions.loadCustomersSuccessAction({ customersList });
      actions = hot('-a', { a: action });
      customersService.getCustomers.and.returnValue(cold('-a', { a: customersList }));

      expect(effects.loadCustomer$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('add customer', () => {
    const customerToAdd: CustomerForAdd = { name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true };
    it('should return a stream with addCustomerSuccessAction action', () => {
      const action = customersActions.addCustomerAction({ customer: customerToAdd });
      const outcome = customersActions.addCustomerSuccessAction({
        customer: { id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true },
      });
      actions = hot('-a', { a: action });
      customersService.postCustomers.and.returnValue(
        cold('-a|', {
          a: { id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true },
        }),
      );

      expect(effects.addCustomer$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('update customer', () => {
    const customerToUpdate: CustomerForUpdate = { name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true };
    it('should return a stream with updateCustomerSuccessAction action', () => {
      const customerUpdated: CustomerDetails = { id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true };
      const action = customersActions.updateCustomerAction({ customer: customerToUpdate, id: 1 });
      const outcome = customersActions.updateCustomerSuccessAction({ customer: customerUpdated, id: 1 });
      actions = hot('-a', { a: action });
      customersService.patchCustomers.and.returnValue(cold('-a|', { a: customerUpdated }));

      expect(effects.updateCustomer$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('delete customer', () => {
    it('should return a stream with deleteCustomerSuccessAction action', () => {
      const action = customersActions.deleteCustomerAction({ id: 1 });
      const outcome = customersActions.deleteCustomerSuccessAction({ id: 1 });
      actions = hot('-a', { a: action });
      customersService.deleteCustomers.and.returnValue(cold('-a|', { a: '' }));

      expect(effects.deleteCustomer$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('customer management failure', () => {
    it('should return a notification', () => {
      let newBackendJsonError: BackendJsonError = {
        errorCode: 0,
        errorType: 0,
      };
      let action = customersActions.customerManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.fromApiValue(newBackendJsonError) });
      actions = hot('-a', { a: action });
      expect(effects.loadCustomer$).toBeObservable(cold(''));

      newBackendJsonError = {
        errorCode: 409,
        errorType: 1002,
      };
      action = customersActions.customerManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.fromApiValue(newBackendJsonError) });
      actions = hot('-a', { a: action });
      expect(effects.addCustomer$).toBeObservable(cold(''));
    });
  });
});
