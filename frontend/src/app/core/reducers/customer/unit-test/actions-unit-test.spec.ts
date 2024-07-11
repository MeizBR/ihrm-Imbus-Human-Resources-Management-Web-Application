import { ActionTypes, customersActions } from '../customer.actions';

import { CustomerDetails } from '../../../../shared/models/customer-models/customer-models-index';
import { BackendJsonError, ErrorType } from '../../../../shared/validators/validation-error-type';
import { CustomerForAdd, CustomerForUpdate } from '../../../../shared/models/customer-models/customer-info-data';

describe('Customer actions', () => {
  describe('Load customers actions', () => {
    it('should create loadCustomersAction action', () => {
      const action = customersActions.loadCustomersAction();
      expect(action).toEqual({ type: ActionTypes.LOAD_CUSTOMERS });
    });

    it('should create loadCustomersSuccessAction action', () => {
      const payload: CustomerDetails[] = [{ id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true }];
      const action = customersActions.loadCustomersSuccessAction({ customersList: payload });

      expect(action).toEqual({ customersList: payload, type: ActionTypes.LOAD_CUSTOMERS_SUCCESS });
    });
  });

  describe('Add customer actions', () => {
    it('should create addCustomerAction action', () => {
      const payload: CustomerForAdd = { name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true };
      const action = customersActions.addCustomerAction({ customer: payload });
      expect(action).toEqual({ customer: payload, type: ActionTypes.ADD_CUSTOMER });
    });

    it('should create addCustomerSuccessAction action', () => {
      const payload: CustomerDetails = { id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true };
      const action = customersActions.addCustomerSuccessAction({ customer: payload });

      expect(action).toEqual({ customer: payload, type: ActionTypes.ADD_CUSTOMER_SUCCESS });
    });
  });

  describe('Update customer actions', () => {
    it('should create updateCustomerAction action', () => {
      const payload: CustomerForUpdate = { name: 'Customer N°1 updated', description: 'the description of Customer N°1 updated', isActive: false };
      const action = customersActions.updateCustomerAction({ customer: payload, id: 1 });

      expect(action).toEqual({
        customer: { name: 'Customer N°1 updated', description: 'the description of Customer N°1 updated', isActive: false },
        id: 1,
        type: ActionTypes.UPDATE_CUSTOMER,
      });
    });

    it('should create updateCustomerSuccessAction action', () => {
      const payload: CustomerDetails = { id: 1, name: 'Customer N°1 updated', description: 'the description of Customer N°1 updated', isActive: false };
      const action = customersActions.updateCustomerSuccessAction({ customer: payload, id: 1 });

      expect(action).toEqual({ customer: payload, id: 1, type: ActionTypes.UPDATE_CUSTOMER_SUCCESS });
    });
  });

  describe('Delete customer actions', () => {
    it('should create deleteCustomerAction action', () => {
      const action = customersActions.deleteCustomerAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_CUSTOMER });
    });

    it('should create deleteCustomerSuccessAction action', () => {
      const action = customersActions.deleteCustomerSuccessAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_CUSTOMER_SUCCESS });
    });
  });

  describe('Customer management actions', () => {
    it('should create customerManagementFailAction action', () => {
      let newBackendJsonError: BackendJsonError = {
        errorCode: 0,
        errorType: 0,
      };
      let action = customersActions.customerManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.fromApiValue(newBackendJsonError) });
      expect(action).toEqual({ withSnackBarNotification: false, errorType: ErrorType.InternalServerError, type: ActionTypes.CUSTOMER_MANAGEMENT_FAIL });

      newBackendJsonError = {
        errorCode: 409,
        errorType: 1002,
      };
      action = customersActions.customerManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.fromApiValue(newBackendJsonError) });
      expect(action).toEqual({ withSnackBarNotification: false, errorType: ErrorType.NameAlreadyExists, type: ActionTypes.CUSTOMER_MANAGEMENT_FAIL });
    });
  });
});
