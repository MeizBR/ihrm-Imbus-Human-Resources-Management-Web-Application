import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NotificationDetails } from '../../shared/models/notification';
import { getNotificationsList } from '../../core/reducers/notifications';
import { AppState } from '../../core/reducers';
import { notificationsActions } from '../../core/reducers/notifications/notifications.actions';
import * as lodash from 'lodash';
import * as moment from 'moment/moment';
import { DateFormat } from '../../shared/enum/interval.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-notifications',
  templateUrl: './all-notifications.component.html',
  styleUrls: ['./all-notifications.component.scss'],
})
export class AllNotificationsComponent implements OnInit {
  public daysOfNotifications: string[] | undefined;
  public notificationsByDay: lodash.Dictionary<{ notifications: NotificationDetails[]; day: string }> = {};

  notificationsList: NotificationDetails[];
  unreadNotificationsCount: number;

  constructor(private store: Store<AppState>, private router: Router) {
  }

  ngOnInit(): void {
    this.store.pipe(select(getNotificationsList)).subscribe(messages => {
      console.log(messages);
      if (messages) {
        this.notificationsList = [...messages];
        // tslint:disable-next-line:max-line-length
        const newnotificationsByDay = lodash.groupBy(this.notificationsList && this.notificationsList.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), (item: NotificationDetails) =>
          moment(item.createdAt).format(DateFormat.FullDate),
        );
        this.daysOfNotifications = Object.keys(newnotificationsByDay).length ? Object.keys(newnotificationsByDay) : undefined;
        this.daysOfNotifications?.forEach(day => {
          this.notificationsByDay[day] = {
            notifications: newnotificationsByDay[day],
            day: day,
          };
        });
        this.calculateUnreadNotifications();
      }
    });
  }

  private calculateUnreadNotifications() {
    this.unreadNotificationsCount = this.notificationsList.filter(notification => !notification.isRead).length;
  }

  markAsRead(notification: NotificationDetails): void {
    this.store.dispatch(notificationsActions.markNotificationAsReadAction({ id: notification.id }));
    this.router.navigate([notification.url]);
  }

  delete(notificationId: number): void {
    this.store.dispatch(notificationsActions.deleteNotificationAction({ id: notificationId }));

  }

  markAllAsRead() {
    this.store.dispatch(notificationsActions.markAllAsReadAction());
  }

  deleteAll() {
    this.store.dispatch(notificationsActions.deleteAllAction());
  }

}
