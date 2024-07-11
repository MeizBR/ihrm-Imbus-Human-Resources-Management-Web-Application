import { Action, createReducer, on } from '@ngrx/store';

import { customersActions } from './customer.actions';

import { CustomerDetails } from '../../../shared/models';
import { ErrorType } from '../../../shared/validators/validation-error-type';

export const customersReducerKey = 'customersReducer';

export interface CustomersState {
  customersList: CustomerDetails[] | undefined;
  error: ErrorType | undefined;
  loadingAction: boolean | undefined;
}

export const initialCustomersState: CustomersState = {
  customersList: undefined,
  error: undefined,
  loadingAction: false,
};

const customersReducer = createReducer(
  initialCustomersState,

  on(
    customersActions.loadCustomersAction,
    (state, _): CustomersState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    customersActions.loadCustomersSuccessAction,
    (state, payload): CustomersState => {
      return { ...state, error: undefined, loadingAction: false, customersList: payload.customersList };
    },
  ),

  on(
    customersActions.addCustomerAction,
    (state, _): CustomersState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    customersActions.addCustomerSuccessAction,
    (state, payload): CustomersState => {
      return { ...state, error: undefined, loadingAction: false, customersList: state.customersList ? [...state.customersList, payload.customer] : [payload.customer] };
    },
  ),

  on(
    customersActions.updateCustomerAction,
    (state, _): CustomersState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    customersActions.updateCustomerSuccessAction,
    (state, payload): CustomersState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        customersList: [...state.customersList.map(customer => (customer.id === payload.id ? payload.customer : customer))],
      };
    },
  ),

  on(
    customersActions.deleteCustomerAction,
    (state, _): CustomersState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    customersActions.deleteCustomerSuccessAction,
    (state, payload): CustomersState => {
      return { ...state, error: undefined, loadingAction: false, customersList: [...state.customersList.filter(customer => customer.id !== payload.id)] };
    },
  ),

  on(
    customersActions.ResetCustomersStateAction,
    (): CustomersState => {
      return { ...initialCustomersState };
    },
  ),

  on(
    customersActions.customerManagementFailAction,
    (state, payload): CustomersState => {
      return { ...state, error: payload.errorType, loadingAction: false };
    },
  ),
);

export function reducer(state: CustomersState | undefined, action: Action): CustomersState {
  return customersReducer(state, action);
}
