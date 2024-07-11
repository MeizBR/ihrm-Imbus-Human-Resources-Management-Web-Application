import { PatchCustomer, PostCustomer } from '../../../generated/models';

export interface CustomerForAdd {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CustomerForUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export function mapToPostCustomer(customer: CustomerForAdd): PostCustomer {
  return {
    name: customer.name.trim(), // NOTE: the trim() function will be deleted after implementation of trim form validator
    description: customer.description,
    isActive: customer.isActive,
  };
}

export function mapToPatchCustomer(customer: CustomerForUpdate): PatchCustomer {
  return {
    name: customer.name ? customer.name.trim() : undefined, // NOTE: the trim() function will be deleted after implementation of trim form validator
    description: customer.description,
    isActive: customer.isActive,
  };
}
