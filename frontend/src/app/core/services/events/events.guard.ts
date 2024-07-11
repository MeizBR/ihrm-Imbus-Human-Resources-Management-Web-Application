import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { eventsActions } from '../../../core/reducers/event/event.actions';
import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';
import { calendarsActions } from '../../../core/reducers/calendar/calendar.actions';

@Injectable({
  providedIn: 'root',
})
export class EventsGuard implements CanActivate {
  constructor(private store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      switchMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(calendarsActions.loadAllCalendarsAction());
          this.store.dispatch(eventsActions.loadAllEventsAction());
        }

        return of(true);
      }),
    );
  }
}
