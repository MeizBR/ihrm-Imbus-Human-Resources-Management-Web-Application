import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { combineLatest, Observable, of } from 'rxjs';
import { concatMap, skipWhile, switchMap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { customersListDetailed } from '../../reducers/customer';
import { selectIsRestoreCompleted, selectUserSession } from '../../reducers/auth';

import { NotificationService } from '../notification.service';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { customersActions } from '../../reducers/customer/customer.actions';
import { projectActions } from '../../reducers/project/project.actions';

@Injectable({
  providedIn: 'root',
})
export class CustomerDetailsGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router, private notificationService: NotificationService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const customerIdFromPath: number = +route.url[route.url.length - 1].path;

    return combineLatest([this.store.pipe(select(selectUserSession)), this.store.pipe(select(selectIsRestoreCompleted))]).pipe(
      skipWhile(([userSession, completed]) => !userSession || !completed),
      concatMap(([userSession, completed]) => {
        if (completed && userSession) {
          this.store.dispatch(projectActions.loadProjectAction());
          this.store.dispatch(customersActions.loadCustomersAction());

          return this.store.pipe(select(customersListDetailed)).pipe(
            skipWhile(customers => customers === undefined),
            switchMap(customers => {
              const isCustomerExist = customers.find(customer => customer.id === customerIdFromPath);
              if (userSession.globalRoles.includes(RoleModel.Administrator)) {
                if (isCustomerExist) {
                  return of(true);
                } else {
                  this.notificationService.warn('Customer Not Found!');
                  this.router.navigate(['home', 'customers']);

                  return of(false);
                }
              } else {
                this.notificationService.warn('Customer Not Found or Missing roles!');
                this.router.navigate(['home', 'customers']);

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
