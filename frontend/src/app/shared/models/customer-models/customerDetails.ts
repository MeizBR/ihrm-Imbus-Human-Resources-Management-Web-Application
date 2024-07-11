import { Customer } from '../../../generated/models';

import { isActionPermitted } from '../element-role';
import { CustomerPermissions } from '../../enum/actions.enum';

export interface CustomerDetails {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CustomerDetailedPermissions {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  userPermissions: UserPermissions;
}

interface UserPermissions {
  canEdit: boolean;
  seeRoles: boolean;
  canDelete: boolean;
}

export function mapCustomerToCustomerDetails(data: Customer): CustomerDetails {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isActive: data.isActive,
  };
}

export function mapCustomerDetailsToCustomerDetailedPermissions(data: CustomerDetails, globalRole: string[]): CustomerDetailedPermissions {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isActive: data.isActive,
    userPermissions: {
      canEdit: isActionPermitted(CustomerPermissions.EditCustomer, globalRole),
      seeRoles: false,
      canDelete: isActionPermitted(CustomerPermissions.DeleteCustomer, globalRole),
    },
  };
}
