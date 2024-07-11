import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { usersActions } from '../../reducers/user/user.actions';
import { projectActions } from '../../reducers/project/project.actions';
import { customersActions } from '../../reducers/customer/customer.actions';
import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';

@Injectable({
  providedIn: 'root',
})
export class ProjectsGuard implements CanActivate {
  constructor(private store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      switchMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(usersActions.loadUsersAction());
          this.store.dispatch(projectActions.loadProjectAction());
          this.store.dispatch(projectActions.loadOwnProjectsAction());
          this.store.dispatch(customersActions.loadCustomersAction());
        }

        return of(true);
      }),
    );
  }
}
