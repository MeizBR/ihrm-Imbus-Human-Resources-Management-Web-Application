import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { select, Store } from '@ngrx/store';

import * as moment from 'moment';

import { Subscription, timer } from 'rxjs';
import { map, skipWhile } from 'rxjs/operators';

import { AppState } from '../../../core/reducers';
import { getCurrentActivity } from '../../../core/reducers/activity';
import { TimerService } from '../../../core/services/activities/timer.service';
import { activityActions } from '../../../core/reducers/activity/activity.actions';

import { TimeFormat } from '../../enum/interval.enum';
import { CurrentActivityState } from '../../enum/current-activity-state.enum';
import { ActivityDetails, ActivityForUpdate, UserSessionDetails } from '../../models';
import { getDuration } from '../../../modules/activity-management/helpers/activity-.helper';
import { WebsocketService } from '../../../core/services/websocket.service';

import { getNotificationsList, getNotificationsListfromWs } from '../../../core/reducers/notifications';
import { notificationsActions } from '../../../core/reducers/notifications/notifications.actions';
import { NotificationDetails } from '../../models/notification';
import { usersActions } from '../../../core/reducers/user/user.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() userSession: UserSessionDetails;

  @Output() onLogOut = new EventEmitter();

  private currentActivity: ActivityDetails;
  private subscriptions$: Subscription[] = [];
  public isTimerStopped = true;
  public now$ = timer(0, 1000).pipe(map(() => moment()));
  public currentTime: string | TimeFormat = TimeFormat.EmptyTimeLabel;
  notificationCount = 0;
  emptyList = true;
  messages: NotificationDetails[] = [];
  notificationIds: number[] = [];

  constructor(private router: Router, private store: Store<AppState>, private timerService: TimerService, private websocketService: WebsocketService) {
    this.subscriptions$.push(this.store.pipe(select(getCurrentActivity)).subscribe(currentActivity => (this.currentActivity = currentActivity)));
    this.store.pipe(select(getNotificationsList)).subscribe(lastMessages => {
      if (lastMessages) {
        for (let  i = 0; i < 5; i++) {
          if (lastMessages[i]) {
          if (!(this.notificationIds.includes(lastMessages[i].id))) {
            this.notificationIds.push(lastMessages[i].id);
            this.messages.push(lastMessages[i]);
            this.emptyList = false;
             }
          }
        }
      }
    });
  }
  ngOnInit(): void {
    this.store.dispatch(usersActions.loadUsersAction());
    this.store.dispatch(notificationsActions.loadNotificationsAction());
    this.store.dispatch(notificationsActions.loadNotificationsActionFromWs());
    this.subscriptions$.push(
      this.now$.pipe(skipWhile(() => !this.currentActivity)).subscribe(date => {
        this.currentTime = this.currentActivity ? getDuration(date, this.currentActivity.start) : TimeFormat.EmptyTimeLabel;
        this.timerService.setTimer(this.currentTime);
        this.isTimerStopped = this.currentTime === TimeFormat.EmptyTimeLabel || this.router.url.includes('timeTracker');
      }),
    );

    this.subscriptions$.push(
      this.store.pipe(select(getNotificationsListfromWs)).subscribe(messages => {
        if (messages) {
          if (!(messages.length === 0)) {
            messages.forEach(message => {
              if (!(this.notificationIds.includes(message.id))) {
                this.notificationIds.push(message.id);
                this.messages.unshift(message);
                this.notificationCount = this.notificationCount + 1;
              }
            });
            this.emptyList = false;
          }
        }
      })
    );

  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach(subscription => subscription.unsubscribe());
  }

  public stopCurrentActivity(): void {
    const activityToPatch: ActivityForUpdate = { ...this.currentActivity, end: new Date().toISOString() };
    this.store.dispatch(activityActions.updateActivityAction({ activity: activityToPatch, currentState: CurrentActivityState.stopped }));
  }

  public logout (): void {
    this.onLogOut.emit();
  }

  toggleBadgeVisibility() {
    this.notificationCount = 0;
  }

  markAsRead(notification: NotificationDetails): void {
    this.router.navigate([notification.url]);
    this.store.dispatch(notificationsActions.markNotificationAsReadAction({ id: notification.id }));
      }
}
