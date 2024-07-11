import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../core/reducers';
import { selectUserSession } from '../../core/reducers/auth';
import { authActions } from '../../core/reducers/auth/auth.actions';
import { loadUserFromLocalStorage } from '../../core/reducers/auth/auth.helper';
import { getJwtToken, removeItems } from '../../core/reducers/auth/auth.helper';
import { activityActions } from '../../core/reducers/activity/activity.actions';

import { RouteSegment } from '../../shared/enum/route-segment.enum';
import { notificationsActions } from '../../core/reducers/notifications/notifications.actions';
import { usersActions } from '../../core/reducers/user/user.actions';

@Injectable({
  providedIn: 'root',
})
export class LogoutGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    return this.store.pipe(select(selectUserSession)).pipe(
      switchMap(userSession => {
        const workspaceId = loadUserFromLocalStorage() ? loadUserFromLocalStorage().workspaceId : userSession?.workspaceId;
        if ((getJwtToken() && userSession) || !getJwtToken() || !userSession) {
          if (!!workspaceId) {
            this.store.dispatch(authActions.RestoreUserSessionAction({ workspaceId }));
            // NOTE: to be removed after implementing the websocket
            if (getJwtToken() && userSession) {
              this.store.dispatch(activityActions.loadSelfActivityAction({}));
            }
          } else {
            removeItems();
            this.router.navigate([RouteSegment.Login]);
          }
        }

        if (!getJwtToken() && !userSession) {
          removeItems();
          this.router.navigate([RouteSegment.Login]);
        }

        return of(true);
      }),
    );
  }

  canActivateChild(): Observable<boolean> {
    return this.canActivate();
  }
}
