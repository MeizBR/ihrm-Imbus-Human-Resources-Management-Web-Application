import { CustomerDetails } from './customer-models/customerDetails';
import { ProjectDetails } from './project-models/project-models-index';

export interface SelectBoxType {
  customers?: CustomerDetails[];
  projects?: ProjectDetails[];
  users?: SelectBoxItems[];
  roles?: SelectBoxItems[];
}

export interface SelectBoxItems {
  id?: number | string;
  name?: string;
}
