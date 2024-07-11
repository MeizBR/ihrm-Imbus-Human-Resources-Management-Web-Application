import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { BaseHttpService } from '../services/base-http.service';
import { AppState } from '../reducers';
import { selectUserWorkspaceId } from '../reducers/auth';
import { Notification } from '../../generated/notification';
import { mapNotificationToNotificationDetails, NotificationDetails } from '../../shared/models/notification';

@Injectable({
  providedIn: 'root',
})
export class UserNotificationService {

  private notificationsPath: string;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
  
   
  }

  public getUserNotifications(): Observable<NotificationDetails[]> {
    const workspaceId = JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    this.notificationsPath = `/workspaces/${workspaceId}/notification`;
    const queryParam = {};
    const userId = JSON.parse(localStorage.getItem('USER_SESSION')).userId;
    queryParam['userId'] = userId;

    return this.baseHttp.get<Notification[]>(this.notificationsPath, { queryParams: queryParam })
      .pipe(map((data: Notification[]) => data.map((notification: Notification) => mapNotificationToNotificationDetails(notification))));
  }

  public markNotificationAsRead(id: number): Observable<NotificationDetails> {
    const workspaceId = JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    this.notificationsPath = `/workspaces/${workspaceId}/notification`;
    const queryParam = {};
    queryParam['notificationId'] = id;

    return this.baseHttp
      .patch<Notification>(this.notificationsPath, { queryParams: queryParam  })
      .pipe(map((data: Notification) => mapNotificationToNotificationDetails(data)));
  }

  public markAllNotificationAsRead(): Observable<NotificationDetails[]> {
    const workspaceId = JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    this.notificationsPath = `/workspaces/${workspaceId}/notification`;
    const queryParam = {};
    const userId = JSON.parse(localStorage.getItem('USER_SESSION')).userId;
    queryParam['userId'] = userId;

    return this.baseHttp
      .post<Notification[]>(this.notificationsPath, { queryParams: queryParam  })
      .pipe(map((data: Notification[]) => data.map((notification: Notification) => mapNotificationToNotificationDetails(notification))));
  }

  public deleteNotification(id: number): Observable<string> {
    const workspaceId = JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    this.notificationsPath = `/workspaces/${workspaceId}/notification`;
    return this.baseHttp
      .delete<string>(this.notificationsPath, { urlParams: id + '' })
      .pipe(map((data: string) => data));
  }
  public deleteAllNotification(): Observable<string> {
    const queryParam = {};
    const userId = JSON.parse(localStorage.getItem('USER_SESSION')).userId;
    queryParam['userId'] = userId;

    return this.baseHttp
      .delete<string>(this.notificationsPath, { queryParams: queryParam  })
      .pipe(map((data: string) => data));
  }
}
