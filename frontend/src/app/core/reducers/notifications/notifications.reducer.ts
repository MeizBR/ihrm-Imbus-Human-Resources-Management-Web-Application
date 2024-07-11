import { Action, createReducer, on } from '@ngrx/store';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { notificationsActions } from './notifications.actions';
import { NotificationDetails } from '../../../shared/models/notification';

export const notificationsReducerKey = 'notificationsReducer';

export interface NotificationsState {
  notificationsList: NotificationDetails[] | undefined;
  notificationListFromWs: NotificationDetails[] | undefined;
  error: ErrorType | undefined;
  loadingAction: boolean | undefined;
  connectionClosed: boolean;
}

export const initialNotificationsState: NotificationsState = {
  notificationsList: undefined,
  notificationListFromWs: undefined,
  error: undefined,
  connectionClosed: false,
  loadingAction: false,
};

const notificationsReducer = createReducer(
  initialNotificationsState,

  on(
    notificationsActions.loadNotificationsActionFromWs,
    (state): NotificationsState => ({ ...state, error: undefined, loadingAction: true })
  ),
  on(
    notificationsActions.loadNotificationsSuccessActionFromWs,
    (state, { notificationsList }): NotificationsState => ({
      ...state,
      error: undefined,
      loadingAction: false,
      notificationListFromWs: notificationsList,
    })
  ),
  on(
    notificationsActions.loadNotificationsFailedActionFromWs,
    (state, { errorType }): NotificationsState => ({
      ...state,
      error: errorType,
      loadingAction: false,
    })
  ),
  on(notificationsActions.closeConnectionSuccessAction, (state) => ({
    ...state,
    connectionClosed: true,
    error: null,
  })),
  on(notificationsActions.closeConnectionFailedAction, (state, { error }) => ({
    ...state,
    connectionClosed: false,
    error: error,
  })),
  on(notificationsActions.loadNotificationsAction, (state) => ({
    ...state,
    error: null,
    loadingAction: true,
  })),
  on(notificationsActions.loadNotificationsSuccessAction, (state, { notificationsList }) => ({
    ...state,
    error: null,
    loadingAction: false,
    notificationsList: notificationsList,
  })),
  on(notificationsActions.loadNotificationsFailedAction, (state, { errorType }) => ({
    ...state,
    error: errorType,
    loadingAction: false,
  })),
  on(notificationsActions.markNotificationAsReadSuccessAction, (state, { notification }) => ({
    ...state,
    error: null,
    loadingAction: false,
    notificationsList: state.notificationsList?.map((item) =>
      item.id === notification.id ? notification : item
    ),
  })),
  on(
    notificationsActions.markNotificationAsReadFailedAction,
    notificationsActions.deleteNotificationFailedAction,
    notificationsActions.markAllAsReadFailedAction,
    notificationsActions.deleteAllFailedAction,
    (state, { errorType }) => ({
      ...state,
      error: errorType,
      loadingAction: false,
    })
  ),
  on(notificationsActions.deleteNotificationSuccessAction, (state, { id }) => ({
    ...state,
    error: null,
    loadingAction: false,
    notificationsList: state.notificationsList?.filter((item) => item.id !== id),
  })),
  on(notificationsActions.ResetNotificationStateAction, (): NotificationsState => ({
    ...initialNotificationsState,
  })),
  on(notificationsActions.deleteAllSuccessAction, (state) => ({
    ...state,
    loadingAction: false,
    error: null,
    notificationsList: [],
  })),
  on(notificationsActions.markAllAsReadSuccessAction, (state, { notifications }) => ({
    ...state,
    error: null,
    loadingAction: false,
    notificationsList: notifications,
  }))
);

export function reducer(state: NotificationsState | undefined, action: Action): NotificationsState {
  return notificationsReducer(state, action);
}
