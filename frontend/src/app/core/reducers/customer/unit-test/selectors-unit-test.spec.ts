import { CustomersState } from '../customer.reducer';
import { customersListDetailed, getCustomersError, selectActiveCustomersList, selectAddCustomerPermission, selectCustomersList } from '..';

import { ErrorType } from '../../../../shared/validators/validation-error-type';

describe('Customers state', () => {
  const initialCustomersState: CustomersState = {
    customersList: undefined,
    error: undefined,
    loadingAction: false,
  };
  const customerA = { id: 1, name: 'Customer N°1', description: 'the description of Customer N°1', isActive: true };
  const customerB = { id: 2, name: 'Customer N°2', description: 'the description of Customer N°2', isActive: false };

  it('Should select the customers list', () => {
    let result = selectCustomersList.projector(initialCustomersState);
    expect(result).toEqual(undefined);

    result = selectCustomersList.projector({ initialCustomersState, customersList: [customerA, customerB] });

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual(customerA);
    expect(result[1]).toEqual(customerB);
  });

  it('Should select the active customers list', () => {
    let result = selectActiveCustomersList.projector([]);
    expect(result).toEqual([]);

    result = selectActiveCustomersList.projector([customerA, customerB]);

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(customerA);
  });

  it('Should select the add customer permission', () => {
    let result = selectAddCustomerPermission.projector([]);
    expect(result).toEqual(false);

    result = selectAddCustomerPermission.projector(['Administrator']);
    expect(result).toEqual(true);
  });

  it('Should select the customers list detailed', () => {
    let result = customersListDetailed.projector([], []);
    expect(result.length).toEqual(0);

    result = customersListDetailed.projector([customerA, customerB], ['Administrator']);

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({ ...customerA, userPermissions: { canEdit: true, seeRoles: false, canDelete: true } });
    expect(result[1]).toEqual({ ...customerB, userPermissions: { canEdit: true, seeRoles: false, canDelete: true } });
  });

  it('Should select the customer error', () => {
    let result = getCustomersError.projector(initialCustomersState);
    expect(result).toEqual(undefined);

    result = getCustomersError.projector({ initialCustomersState, error: ErrorType.NameAlreadyExists });
    expect(result).toEqual(ErrorType.NameAlreadyExists);
  });
});
