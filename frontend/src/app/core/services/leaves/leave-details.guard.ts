import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { concatMap, skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { leavesActions } from '../../reducers/leave/leave.actions';
import { getUserLeavesDetailsList } from '../../reducers/leave/index';
import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';

import { NotificationService } from '../notification.service';

import { RoleModel } from '../../../shared/enum/role-model.enum';

@Injectable({
  providedIn: 'root',
})
export class LeaveDetailsGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router, private notificationService: NotificationService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const leaveIdFromPath: number = +route.url[route.url.length - 1].path;

    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      concatMap(([userSession, completed]) => {
        if (completed && userSession) {
          // NOTE: This call to be deleted after implementing the messaging
          this.store.dispatch(leavesActions.loadAllLeavesAction());

          return this.store.pipe(select(getUserLeavesDetailsList)).pipe(
            skipWhile(res => !res || !res.length), // FIXME: this cause a problem! when `res.length === 0` shouldn't be skipped
            switchMap(leaves => {
              const isLeaveExists = leaves.find(leave => leave.id === leaveIdFromPath);

              if (userSession.globalRoles.includes(RoleModel.Administrator)) {
                if (isLeaveExists) {
                  this.store.dispatch(leavesActions.loadLeaveDetailsAction({ leaveId: leaveIdFromPath }));

                  return of(true);
                } else {
                  this.notificationService.warn('Leave Not Found!');
                  this.router.navigate(['home', 'leaves']);

                  return of(false);
                }
              } else {
                if (isLeaveExists?.userId === userSession?.userId) {
                  this.store.dispatch(leavesActions.loadLeaveDetailsAction({ leaveId: leaveIdFromPath }));

                  return of(true);
                } else {
                  this.notificationService.warn('Missing roles!');
                  this.router.navigate(['home', 'leaves']);

                  return of(false);
                }
              }
            }),
          );
        }

        return of(false);
      }),
    );
  }
}
