import * as fromReducer from '../customer.reducer';
import { customersActions } from '../customer.actions';

describe('Customer reducer', () => {
  describe('An unknown action', () => {
    it('should return the default state', () => {
      const state = fromReducer.reducer(fromReducer.initialCustomersState, { type: undefined });

      expect(state).toBe(fromReducer.initialCustomersState);
    });
  });
  const customerState: fromReducer.CustomersState = {
    customersList: [{ id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true }],
    error: undefined,
    loadingAction: false,
  };

  describe('Dispatch actions', () => {
    it('should load all customers and update the state in an immutable way', () => {
      const customersList = [
        { id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true },
        { id: 2, name: 'Customer N°2', description: 'the description of Customer N°2', isActive: false },
      ];
      const newState: fromReducer.CustomersState = { customersList, error: undefined, loadingAction: false };
      const state = fromReducer.reducer(fromReducer.initialCustomersState, customersActions.loadCustomersSuccessAction({ customersList }));

      expect(state).toEqual(newState);
    });

    it('should add new customer and update the state in an immutable way', () => {
      const state = fromReducer.reducer(
        fromReducer.initialCustomersState,
        customersActions.addCustomerSuccessAction({
          customer: { id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true },
        }),
      );
      expect(state).toEqual(customerState);
    });

    it('should update an existing customer and update the state in an immutable way', () => {
      let state = fromReducer.reducer(customerState, { type: undefined });
      expect(state).toEqual(customerState);

      const expectedState: fromReducer.CustomersState = {
        customersList: [{ id: 1, name: 'Customer N°1', description: 'the description of Customer N°1 updated', isActive: false }],
        error: undefined,
        loadingAction: false,
      };

      state = fromReducer.reducer(
        customerState,
        customersActions.updateCustomerSuccessAction({
          customer: { id: 1, name: 'Customer N°1', description: 'the description of Customer N°1 updated', isActive: false },
          id: 1,
        }),
      );

      expect(state).toEqual(expectedState);
    });

    it('should delete an existing customer and update the state in an immutable way', () => {
      const initialCustomersState = customerState;
      let state = fromReducer.reducer(initialCustomersState, { type: undefined });

      expect(state).toEqual(initialCustomersState);

      const expectedState: fromReducer.CustomersState = { customersList: [], error: undefined, loadingAction: false };
      state = fromReducer.reducer(initialCustomersState, customersActions.deleteCustomerSuccessAction({ id: 1 }));

      expect(state).toEqual(expectedState);
    });
  });
});
