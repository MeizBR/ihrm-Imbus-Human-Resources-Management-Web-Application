import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { WebsocketService } from '../../services/websocket.service';
import { notificationsActions } from './notifications.actions';
import { NotificationService } from '../../services/notification.service';
import { UserNotificationService } from '../../user_notifications/user-notification.service';

@Injectable()
export class NotificationsEffects {
  loadNotificationsFromWs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationsActions.loadNotificationsActionFromWs),
      switchMap(_ =>
        this.webSocketService.getActivityNotification$().pipe(
          map(notifications => notificationsActions.loadNotificationsSuccessActionFromWs({ notificationsList: notifications })),
          catchError(error => {
            this.notificationService.warn('WebSocket error: ' + error.message);

            return of(notificationsActions.loadNotificationsFailedActionFromWs({ errorType: error }));
          })
        )
      )
    )
  );

  loadNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationsActions.loadNotificationsAction),
      switchMap(_ =>
        this.userNotificationsService.getUserNotifications().pipe(
          map(notifications => notificationsActions.loadNotificationsSuccessAction({ notificationsList: notifications })),
          catchError(error => {
            this.notificationService.warn('Error loading notifications: ' + error.message);

            return of(notificationsActions.loadNotificationsFailedAction({ errorType: error }));
          })
        )
      )
    )
  );

  markAllNotificationAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationsActions.markAllAsReadAction),
      switchMap(() =>
        this.userNotificationsService.markAllNotificationAsRead().pipe(
          map(notification =>
            notificationsActions.markAllAsReadSuccessAction({ notifications: notification })
          ),
          catchError(error => {
            this.notificationService.warn('Error marking notification as read: ' + error.message);

            return of(notificationsActions.markAllAsReadFailedAction({ errorType: error }));
          })
        )
      )
    )
  );

  markNotificationAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationsActions.markNotificationAsReadAction),
      switchMap(({ id }) =>
        this.userNotificationsService.markNotificationAsRead(id).pipe(
          map(notification =>
            notificationsActions.markNotificationAsReadSuccessAction({ notification })
          ),
          catchError(error => {
            this.notificationService.warn('Error marking notification as read: ' + error.message);

            return of(notificationsActions.markNotificationAsReadFailedAction({ errorType: error }));
          })
        )
      )
    )
  );

  deleteNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationsActions.deleteNotificationAction),
      switchMap(({ id }) =>
        this.userNotificationsService.deleteNotification(id).pipe(
          map(() => notificationsActions.deleteNotificationSuccessAction({ id })),
          catchError(error => {
            this.notificationService.warn('Error deleting notification: ' + error.message);

            return of(notificationsActions.deleteNotificationFailedAction({ errorType: error }));
          })
        )
      )
    )
  );

  deleteAllNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationsActions.deleteAllAction),
      switchMap(() =>
        this.userNotificationsService.deleteAllNotification().pipe(
          map(() => notificationsActions.deleteAllSuccessAction()),
          catchError(error => {
            this.notificationService.warn('Error deleting notification: ' + error.message);

            return of(notificationsActions.deleteAllFailedAction({ errorType: error }));
          })
        )
      )
    )
  );

  closeNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationsActions.closeConnectionAction),
      switchMap(() => {
        this.webSocketService.closeConnection();

        return of(notificationsActions.closeConnectionSuccessAction());
      }),
      catchError(error => {
        // Handle error if needed
        return of(notificationsActions.closeConnectionFailedAction({ error }));
      })
    )
  );

  constructor(
    private actions$: Actions,
    private webSocketService: WebsocketService,
    private router: Router,
    private notificationService: NotificationService,
    private userNotificationsService: UserNotificationService
  ) {}
}
