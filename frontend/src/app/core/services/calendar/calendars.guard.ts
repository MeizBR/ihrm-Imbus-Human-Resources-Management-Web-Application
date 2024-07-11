import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { concatMap, skipWhile } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { usersActions } from '../../reducers/user/user.actions';
import { eventsActions } from '../../reducers/event/event.actions';
import { leavesActions } from '../../reducers/leave/leave.actions';
import { projectActions } from '../../../core/reducers/project/project.actions';
import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';
import { calendarsActions } from '../../../core/reducers/calendar/calendar.actions';

@Injectable({
  providedIn: 'root',
})
export class CalendarsGuard implements CanActivate {
  constructor(private store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      concatMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(usersActions.loadUsersAction());
          this.store.dispatch(projectActions.loadProjectAction());
          this.store.dispatch(leavesActions.loadAllLeavesAction());
          this.store.dispatch(eventsActions.loadAllEventsAction());
          this.store.dispatch(projectActions.loadOwnProjectsAction());
          this.store.dispatch(calendarsActions.loadAllCalendarsAction());

          const filteredCalendars = JSON.parse(localStorage.getItem('filteredCalendars'));
          const filteredUsersLeaves = JSON.parse(localStorage.getItem('filteredUsersLeaves'));
          this.store.dispatch(
            calendarsActions.setCalendarsFilterListAction({
              filterList: {
                usersLeavesFilter: filteredUsersLeaves,
                calendarsListFilter: filteredCalendars,
              },
            }),
          );

          return of(true);
        } else {
          return of(false);
        }
      }),
    );
  }
}
