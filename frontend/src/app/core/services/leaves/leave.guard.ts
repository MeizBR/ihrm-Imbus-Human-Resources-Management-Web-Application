import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { leavesActions } from '../../reducers/leave/leave.actions';
import { usersActions } from '../../../core/reducers/user/user.actions';

import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';

@Injectable({
  providedIn: 'root',
})
export class LeaveGuard implements CanActivate {
  constructor(private store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      switchMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(usersActions.loadUsersAction());
          this.store.dispatch(leavesActions.loadAllLeavesAction());

          return of(true);
        }
      }),
    );
  }
}
