import { Activity } from '../../../generated/activity';
import { getDuration } from '../../../modules/activity-management/helpers/activity-.helper';

export interface ActivityDetails {
  id: number;
  userId: number;
  projectId?: number;
  description: string;
  start: string; // FIXME: change it to Datetime
  end?: string; // FIXME: change it to Datetime
  projectName?: string;
  customerName?: string;
  userName?: string;
  read?: boolean ;
  workDuration?: string;
  restartActivityPermission?: boolean;
}

export function mapActivityToActivityDetails(data: Activity): ActivityDetails {
  return {
    id: data.id,
    userId: data.userId,
    projectId: data.projectId,
    description: data.description,
    start: data.start,
    end: data.end,
    workDuration: data.end ? getDuration(data.end, data.start) : '',
  };
}
