import { Notification } from '../../generated/notification';
import { isActionPermitted } from './element-role';
import { ProjectPermissions } from '../enum/actions.enum';
import { ProjectDetails } from './project-models/project-details';
import { NotificationsType, NotificationType } from '../enum/NotificationType';
import { LeaveState } from '../enum/leave-state.enum';

export interface NotificationDetails {
  id: number;
  notifiedUser: number;
  description: string;
  url: string;
  notificationType: NotificationType;
  userId?: number;
  userName?: string;
  createdAt: string;
  isRead: boolean;

}

export function mapNotificationToNotificationDetails(data: Notification): NotificationDetails {
  const options = { weekday: 'short', day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true };

  return {
    createdAt: data.createdAt,
    description: data.description,
    id: data.id,
    isRead: data.isRead,
    notificationType: NotificationsType.fromApiValue(data.notificationType),
    notifiedUser: data.notifiedUser ,
    url: data.url,
    userId: data.userId
  };
}
