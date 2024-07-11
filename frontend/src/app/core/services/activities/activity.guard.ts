import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { selectUserSession } from '../../reducers/auth';
import { selectIsRestoreCompleted } from '../../reducers/auth/index';
import { projectActions } from '../../reducers/project/project.actions';
import { activityActions } from '../../reducers/activity/activity.actions';
import { notificationsActions } from '../../reducers/notifications/notifications.actions';
import { usersActions } from '../../reducers/user/user.actions';

@Injectable({
  providedIn: 'root',
})
export class ActivityGuard implements CanActivate {
  constructor(private store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      switchMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(projectActions.loadProjectAction());
          this.store.dispatch(projectActions.loadOwnProjectsAction());
          this.store.dispatch(activityActions.loadSelfActivityAction({}));
          this.store.dispatch(usersActions.loadUsersAction());
        }

        return of(true);
      }),
    );
  }
}
