import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { catchError, concatMap, skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { getSelectedCalendar } from '../../reducers/calendar';
import { projectActions } from '../../reducers/project/project.actions';
import { calendarsActions } from '../../reducers/calendar/calendar.actions';
import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';

import { NotificationService } from '../notification.service';

import { RoleModel } from '../../../shared/enum/role-model.enum';

@Injectable({
  providedIn: 'root',
})
export class CalendarDetailsGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router, private notificationService: NotificationService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const calendarIdFromPath: number = +route.url[route.url.length - 1].path;

    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      concatMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(calendarsActions.loadCalendarDetailsAction({ calendarId: calendarIdFromPath }));

          return this.store.pipe(select(getSelectedCalendar)).pipe(
            skipWhile(selectedCalendar => selectedCalendar === undefined),
            switchMap(selectedCalendar => {
              if (userSession?.globalRoles.includes(RoleModel.Administrator)) {
                this.store.dispatch(projectActions.loadUserProjectsAction({ userId: selectedCalendar?.userId }));

                return of(true);
              }
              if (selectedCalendar && userSession?.userId === selectedCalendar?.userId) {
                return of(true);
              }
              this.notificationService.warn('Calendar Not Found or Missing roles!');
              this.store.dispatch(calendarsActions.clearSelectedCalendarAction());
              this.router.navigate(['home', 'calendars']);

              return of(false);
            }),
            catchError(err => {
              this.notificationService.warn('Catch error' + err);
              this.router.navigate(['home', 'calendars']);

              return of(false);
            }),
          );
        } else {
          return of(false);
        }
      }),
    );
  }
}
