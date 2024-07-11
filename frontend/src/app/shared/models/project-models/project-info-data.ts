import { PostProject } from '../../../generated/postProject';
import { PatchProject } from '../../../generated/patchProject';
import { ProjectDetails } from './project-details';

export interface ProjectForAdd {
  customerId: number;
  name: string;
  description?: string;
  note?: string;
  isActive?: boolean;
}

export interface ProjectForUpdate {
  id?: number;
  customerId: number;
  name?: string;
  description?: string;
  note?: string;
  isActive?: boolean;
}

export function mapToProjectForUpdate(data: ProjectDetails): ProjectForUpdate {
  return {
    id: data.id,
    customerId: data.customerId,
    name: data.name,
    description: data.description,
    note: data.note,
    isActive: data.isActive,
  };
}

export function mapToPostProject(data: ProjectForAdd): PostProject {
  return {
    customerId: data.customerId,
    name: data.name,
    description: data.description,
    note: data.note,
    isActive: data.isActive,
  };
}

export function mapToPatchProject(data: ProjectForUpdate): PatchProject {
  return {
    name: data.name,
    customerId: data.customerId,
    description: data.description,
    note: data.note,
    isActive: data.isActive,
  };
}
