import { createSelector } from '@ngrx/store';
import * as notificationsReducer from './notifications.reducer';
import { AppState } from '../index';
import { mappedUsersList } from '../user';
import { NotificationDetails } from '../../../shared/models/notification';

export const selectFeature = (state: AppState) => state[notificationsReducer.notificationsReducerKey];
export const selectNotificationsList = createSelector(selectFeature, state => state.notificationsList);
export const selectNotificationsListfromWs = createSelector(selectFeature, state => state.notificationListFromWs);

export const getNotificationsList = createSelector(selectNotificationsList, mappedUsersList, (notifications, users): NotificationDetails[] =>
  notifications?.map(notification => ({
    ...notification,
    userName: users?.find(user => user.id === notification.userId)?.fullName,
    read: true,
  })),
);
export const getNotificationsListfromWs = createSelector(selectNotificationsListfromWs, mappedUsersList, (notifications, users): NotificationDetails[] =>
  notifications?.map(notification => ({
    ...notification,
    userName: users?.find(user => user.id === notification.userId)?.fullName,
    read: true,
  })),
);

export const getNotificationsError = createSelector(selectFeature, state => state.error);
export const getNotificationsLoading = createSelector(selectFeature, state => state.loadingAction);
