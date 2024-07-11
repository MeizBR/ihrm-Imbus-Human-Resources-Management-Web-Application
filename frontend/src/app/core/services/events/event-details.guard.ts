import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { getSelectedEventDetails } from '../../reducers/event';
import { eventsActions } from '../../reducers/event/event.actions';
import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';

import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root',
})
export class EventDetailsGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router, private notificationService: NotificationService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const eventIdFromPath: number = +route.url[route.url.length - 1].path;

    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      switchMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(eventsActions.loadEventDetailsAction({ eventId: eventIdFromPath }));

          return this.store.pipe(select(getSelectedEventDetails)).pipe(
            skipWhile(events => !events),
            switchMap(events => {
              if (events) {
                return of(true);
              } else {
                this.notificationService.warn('Missing role or Event Not Found !');
                this.router.navigate(['home', 'events']);

                return of(false);
              }
            }),
          );
        } else {
          return of(false);
        }
      }),
    );
  }
}
