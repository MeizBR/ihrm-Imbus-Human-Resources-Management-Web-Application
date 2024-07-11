import { createSelector } from '@ngrx/store';

import { AppState } from '../index';
import { selectGlobalRoles } from '../auth/index';
import * as customersReducer from './customer.reducer';

import { CustomerPermissions } from '../../../shared/enum/actions.enum';
import { globalActionPermitted } from '../../../shared/models/element-role';
import { mapCustomerDetailsToCustomerDetailedPermissions } from '../../../shared/models';

export const selectFeature = (state: AppState) => state[customersReducer.customersReducerKey];
export const selectCustomersList = createSelector(selectFeature, state => state.customersList);
export const selectAddCustomerPermission = createSelector(selectGlobalRoles, role => globalActionPermitted(CustomerPermissions.AddCustomer, role, 'customer'));

export const customersListDetailed = createSelector(selectCustomersList, selectGlobalRoles, (customers, globalRoles) => {
  return customers && customers.map(cus => mapCustomerDetailsToCustomerDetailedPermissions(cus, globalRoles));
});

export const selectActiveCustomersList = createSelector(selectCustomersList, customers => customers?.filter(customer => customer.isActive));

export const getCustomersError = createSelector(selectFeature, state => state.error);
export const getCustomersLoading = createSelector(selectFeature, state => state.loadingAction);
