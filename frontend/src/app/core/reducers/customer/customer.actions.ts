import { createAction, props } from '@ngrx/store';

import { CustomerDetails } from '../../../shared/models';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { CustomerForAdd, CustomerForUpdate } from '../../../shared/models/customer-models/customer-info-data';

export enum ActionTypes {
  /** Customer management actions types */
  LOAD_CUSTOMERS = '[customerManagement] Load Customers',
  LOAD_CUSTOMERS_SUCCESS = '[customerManagement] Load Customers Success',

  ADD_CUSTOMER = '[customerManagement] Add Customer',
  ADD_CUSTOMER_SUCCESS = '[customerManagement] Add Customer Success',

  UPDATE_CUSTOMER = '[customerManagement] Update Customer',
  UPDATE_CUSTOMER_SUCCESS = '[customerManagement] Update Customer Success',

  DELETE_CUSTOMER = '[customerManagement] Delete Customer',
  DELETE_CUSTOMER_SUCCESS = '[customerManagement] Delete Customer Success',

  /** Reset customers state action types*/
  RESET_CUSTOMERS_STATE = '[customerManagement] Reset State',

  /** Customers management fail action types*/
  CUSTOMER_MANAGEMENT_FAIL = '[userManagement] Customer Management Failed',
}

export const customersActions = {
  /** Customers management actions */
  loadCustomersAction: createAction(ActionTypes.LOAD_CUSTOMERS),
  loadCustomersSuccessAction: createAction(ActionTypes.LOAD_CUSTOMERS_SUCCESS, props<{ customersList: CustomerDetails[] }>()),

  addCustomerAction: createAction(ActionTypes.ADD_CUSTOMER, props<{ customer: CustomerForAdd }>()),
  addCustomerSuccessAction: createAction(ActionTypes.ADD_CUSTOMER_SUCCESS, props<{ customer: CustomerDetails }>()),

  updateCustomerAction: createAction(ActionTypes.UPDATE_CUSTOMER, props<{ customer: CustomerForUpdate; id: number }>()),
  updateCustomerSuccessAction: createAction(ActionTypes.UPDATE_CUSTOMER_SUCCESS, props<{ customer: CustomerDetails; id: number }>()),

  deleteCustomerAction: createAction(ActionTypes.DELETE_CUSTOMER, props<{ id: number }>()),
  deleteCustomerSuccessAction: createAction(ActionTypes.DELETE_CUSTOMER_SUCCESS, props<{ id: number }>()),

  /** Reset customers state actions*/
  ResetCustomersStateAction: createAction(ActionTypes.RESET_CUSTOMERS_STATE),

  /** Reset customers state actions*/
  customerManagementFailAction: createAction(ActionTypes.CUSTOMER_MANAGEMENT_FAIL, props<{ withSnackBarNotification: boolean; errorType: ErrorType }>()),
};
