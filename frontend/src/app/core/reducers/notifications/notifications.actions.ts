import { createAction, props } from '@ngrx/store';
import { ErrorType } from '../../../shared/validators';
import { NotificationDetails } from '../../../shared/models/notification';

export enum ActionTypes {
  /** Load Notifications action types */
  LOAD_NotificationsFromWs = '[Notifications] Load Notifications from ws',
  LOAD_Notifications_SUCCESS_FromWs = '[Notifications] Load Notifications Success from ws',
  LOAD_Notifications_FAILED_FromWs = '[Notifications] Load Notifications Failed from ws',
  CLOSE_Connection= '[Notifications] Close Connection',
  CLOSE_Notifications_SUCCESS = '[Notifications] Close Connection Success',
  CLOSE_Notifications_FAILED = '[Notifications] Close Connection Failed',
  LOAD_Notifications = '[Notifications] Load Notifications',
  LOAD_Notifications_SUCCESS = '[Notifications] Load Notifications Success',
  LOAD_Notifications_FAILED = '[Notifications] Load Notifications Failed',
  MARK_Notification_AS_READ = '[Notifications] Mark Notification As Read',
  MARK_Notification_AS_READ_SUCCESS = '[Notifications] Mark Notification As Read Success',
  MARK_Notification_AS_READ_FAILED = '[Notifications] Mark Notification As Read Failed',
  DELETE_Notification = '[Notifications] Delete Notification',
  DELETE_Notification_SUCCESS = '[Notifications] Delete Notification Success',
  DELETE_Notification_FAILED = '[Notifications] Delete Notification Failed',
  MARK_All_AS_READ = '[Notifications] Mark  ALL Notification As Read',
  MARK_All_AS_READ_SUCCESS = '[Notifications] Mark all Notifications As Read Success',
  MARK_All_AS_READ_FAILED = '[Notifications] Mark  all Notifications As Read Failed',
  DELETE_All = '[Notifications] Delete All Notification',
  DELETE_All_SUCCESS = '[Notifications] Delete  ALL  Notifications Success',
  DELETE_All_FAILED = '[Notifications] Delete all Notification Failed',
  RESET_NOTIFICATIONS_STATE = '[leaveManagement] Reset State',

}

export const notificationsActions = {
  loadNotificationsActionFromWs: createAction(ActionTypes.LOAD_NotificationsFromWs),
  loadNotificationsSuccessActionFromWs: createAction(ActionTypes.LOAD_Notifications_SUCCESS_FromWs, props<{ notificationsList:  NotificationDetails[] }>()),
  loadNotificationsFailedActionFromWs: createAction(ActionTypes.LOAD_Notifications_FAILED_FromWs, props<{ errorType: ErrorType }>()),
  closeConnectionAction: createAction(ActionTypes.CLOSE_Connection),
  closeConnectionSuccessAction: createAction(ActionTypes.CLOSE_Notifications_SUCCESS),
  closeConnectionFailedAction: createAction(ActionTypes.CLOSE_Notifications_FAILED, props<{ error: ErrorType }>()),
  loadNotificationsAction: createAction(ActionTypes.LOAD_Notifications),
  loadNotificationsSuccessAction: createAction(ActionTypes.LOAD_Notifications_SUCCESS, props<{ notificationsList: NotificationDetails[] }>()),
  loadNotificationsFailedAction: createAction(ActionTypes.LOAD_Notifications_FAILED, props<{ errorType: ErrorType }>()),
  markNotificationAsReadAction: createAction(ActionTypes.MARK_Notification_AS_READ, props<{ id: number }>()),
  markNotificationAsReadSuccessAction: createAction(ActionTypes.MARK_Notification_AS_READ_SUCCESS, props<{ notification: NotificationDetails }>()),
  markNotificationAsReadFailedAction: createAction(ActionTypes.MARK_Notification_AS_READ_FAILED, props<{ errorType: ErrorType }>()),
  deleteNotificationAction: createAction(ActionTypes.DELETE_Notification, props<{ id: number }>()),
  deleteNotificationSuccessAction: createAction(ActionTypes.DELETE_Notification_SUCCESS, props<{ id: number }>()),
  deleteNotificationFailedAction: createAction(ActionTypes.DELETE_Notification_FAILED, props<{ errorType: ErrorType }>()),
  deleteAllAction: createAction(ActionTypes.DELETE_All),
  deleteAllSuccessAction: createAction(ActionTypes.DELETE_All_SUCCESS),
  deleteAllFailedAction: createAction(ActionTypes.DELETE_All_FAILED, props<{ errorType: ErrorType }>()),
  markAllAsReadAction: createAction(ActionTypes.MARK_All_AS_READ),
  markAllAsReadSuccessAction: createAction(ActionTypes.MARK_All_AS_READ_SUCCESS, props<{ notifications: NotificationDetails[] }>()),
  markAllAsReadFailedAction: createAction(ActionTypes.MARK_All_AS_READ_FAILED, props<{ errorType: ErrorType }>()),
  ResetNotificationStateAction: createAction(ActionTypes.RESET_NOTIFICATIONS_STATE),

};
