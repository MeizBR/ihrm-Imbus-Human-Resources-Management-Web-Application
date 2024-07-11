import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { concatMap, skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { selectUsersList } from '../../reducers/user';
import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';
import { NotificationService } from '../../../core/services/notification.service';

import { RoleModel } from '../../../shared/enum/role-model.enum';

@Injectable({
  providedIn: 'root',
})
export class UserProfileGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router, private notificationService: NotificationService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const userIdFromPath: number = +route.url[route.url.length - 1].path;

    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !(userSession && completed)),
      concatMap(([userSession, completed]) => {
        if (completed && userSession) {
          return this.store.pipe(select(selectUsersList)).pipe(
            skipWhile(users => !users),
            switchMap(users => {
              const isUserExist = users.find(us => us.id === userIdFromPath);
              if (userSession.globalRoles.includes(RoleModel.Administrator)) {
                if (isUserExist) {
                  return of(true);
                } else {
                  this.notificationService.warn('User Not Found!');
                  this.router.navigate(['home', 'team']);

                  return of(false);
                }
              } else {
                if (userSession.userId === userIdFromPath) {
                  return of(true);
                } else {
                  this.notificationService.warn('Missing roles!');
                  this.router.navigate(['home', 'team']);

                  return of(false);
                }
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
