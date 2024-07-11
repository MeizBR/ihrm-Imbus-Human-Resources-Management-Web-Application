import { Calendar } from '../../../generated/calendar';

export interface CalendarDetails {
  id: number;
  project?: number;
  projectName?: string;
  isActiveProject?: boolean;
  name: string;
  description: string;
  isPrivate: boolean;
  userId: number;
  timeZone: string;
  userPermission?: CalendarUserPermission;
}

export interface CalendarUserPermission {
  canEdit?: boolean;
  canDelete?: boolean;
  canUpdateVisibility?: boolean;
}

export function mapCalendarToCalendarDetails(data: Calendar): CalendarDetails {
  return {
    id: data.id,
    project: data.projectId,
    name: data.name,
    description: data.description,
    isPrivate: data.isPrivate,
    userId: data.userId,
    timeZone: data.timeZone,
  };
}
