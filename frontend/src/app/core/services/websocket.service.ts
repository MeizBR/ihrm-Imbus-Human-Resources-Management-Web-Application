import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { delay, delayWhen, map, retryWhen } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { getJwtToken } from '../reducers/auth/auth.helper';
import { ActivityDetails, mapActivityToActivityDetails } from '../../shared/models';
import { Notification } from '../../generated/notification';
import { select, Store } from '@ngrx/store';
import { selectUserWorkspaceId } from '../reducers/auth';
import { AppState } from '../reducers';
import { NotificationsType } from '../../shared/enum/NotificationType';
import { mapNotificationToNotificationDetails, NotificationDetails } from '../../shared/models/notification';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  // tslint:disable-next-line:no-any
  private socket$: WebSocketSubject<any>;
  private workspaceId: number;
  private socketPath: string;
  private token: string;

  constructor(private store: Store<AppState>) {
    // this.store.pipe(select(selectUserWorkspaceId)).subscribe(workspaceId => {
    //   this.workspaceId = workspaceId;
      
    //   console.log(this.socketPath);
    // });

  }
  private updateSocket() {

    this.workspaceId = JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    this.socketPath = `ws://localhost:9000/api/workspaces/${this.workspaceId}/messaging/`;
    this.token = JSON.parse(localStorage.getItem('USER_SESSION')).token;
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.complete();
    }
    this.socket$ = webSocket(this.socketPath + this.token);
  }

  // tslint:disable-next-line:no-any
  public connect(): WebSocketSubject<any> {
    this.updateSocket();

    return this.socket$;
  }

    public getActivityNotification$(): Observable<NotificationDetails[]> {
    return this.connect().pipe(
      map((data: Notification[]) => data.map((notification: Notification) => mapNotificationToNotificationDetails(notification))),
      retryWhen(errors => errors.pipe(
        delayWhen(() => timer(155000)) // retry after 1 second
      ))
    );
  }

  closeConnection() {
    this.socket$.complete();
  }
}
