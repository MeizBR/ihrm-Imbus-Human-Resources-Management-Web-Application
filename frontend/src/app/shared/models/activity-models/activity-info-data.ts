import { PostActivity } from 'src/app/generated/models';
import { PatchActivity } from '../../../generated/patchActivity';

export interface ActivityForAdd {
  userId: number;
  projectId?: number;
  description: string;
  restartActivityPermission?: boolean;
}

export interface ActivityForUpdate {
  id?: number;
  userId?: number;
  projectId?: number;
  description?: string;
  start?: string;
  end?: string;
  restartActivityPermission?: boolean;
}

export function mapToPostActivity(data: ActivityForAdd): PostActivity {
  return {
    userId: data.userId,
    projectId: data.projectId,
    description: data.description,
  };
}

export function mapToPatchActivity(data: ActivityForUpdate): PatchActivity {
  return {
    userId: data.userId,
    projectId: data.projectId,
    description: data.description,
    start: data.start,
    end: data.end,
  };
}

export function mapPatchActivityToActivityForUpdate(data: PatchActivity): ActivityForUpdate {
  return {
    userId: data.userId,
    projectId: data.projectId,
    description: data.description,
    start: data.start,
    end: data.end,
  };
}
