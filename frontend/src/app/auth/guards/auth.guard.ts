import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { AppState } from '../../core/reducers';
import { usersActions } from '../../core/reducers/user/user.actions';
import { leavesActions } from '../../core/reducers/leave/leave.actions';
import { projectActions } from '../../core/reducers/project/project.actions';
import { activityActions } from '../../core/reducers/activity/activity.actions';
import { customersActions } from '../../core/reducers/customer/customer.actions';
import { calendarsActions } from '../../core/reducers/calendar/calendar.actions';

import { getJwtToken } from '../../core/reducers/auth/auth.helper';
import { RouteSegment } from '../../shared/enum/route-segment.enum';
import { eventsActions } from '../../core/reducers/event/event.actions';
import { settingsActions } from '../../core/reducers/settings/settings.actions';
import { notificationsActions } from '../../core/reducers/notifications/notifications.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private store: Store<AppState>) {}

  canActivate(): boolean {
    if (!!getJwtToken()) {
      this.router.navigate([RouteSegment.Home]);
    }

    this.store.dispatch(activityActions.ResetActivitiesStateAction());
    this.store.dispatch(usersActions.ResetUsersStateAction());
    this.store.dispatch(leavesActions.ResetLeaveStateAction());
    this.store.dispatch(projectActions.ResetProjectsStateAction());
    this.store.dispatch(customersActions.ResetCustomersStateAction());
    this.store.dispatch(calendarsActions.ResetCalendarStateAction());
    this.store.dispatch(eventsActions.ResetEventsStateAction());
    this.store.dispatch(settingsActions.ResetSettingsStateAction());
    this.store.dispatch(notificationsActions.ResetNotificationStateAction());

    return !getJwtToken();
  }
}
