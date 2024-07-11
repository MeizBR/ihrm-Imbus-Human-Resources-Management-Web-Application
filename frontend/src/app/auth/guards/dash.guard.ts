import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { skipWhile, switchMap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AppState } from '../../core/reducers';
import { selectIsRestoreCompleted, selectUserSession } from '../../core/reducers/auth';
import { projectActions } from '../../core/reducers/project/project.actions';
import { activityActions } from '../../core/reducers/activity/activity.actions';
import { customersActions } from '../../core/reducers/customer/customer.actions';
import { getDetailedProjectsList } from '../../core/reducers/project';

@Injectable({
  providedIn: 'root'
})
export class DashGuard implements CanActivate {
  constructor(private store: Store<AppState>) {}

  canActivate(): Observable<boolean> {
    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      switchMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(customersActions.loadCustomersAction());
          this.store.dispatch(projectActions.loadProjectAction());
          this.store.dispatch(projectActions.loadOwnProjectsAction());
        }

        return of(true);
      }),
    );
  }
}
