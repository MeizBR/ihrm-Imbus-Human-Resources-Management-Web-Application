import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../core/reducers';
import { selectUserSession } from '../core/reducers/auth';
import { authActions } from '../core/reducers/auth/auth.actions';

import { UserSessionDetails } from '../shared/models/UserSessionDetails';
import { notificationsActions } from '../core/reducers/notifications/notifications.actions';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public userSession$: Observable<UserSessionDetails>;

  constructor(private store: Store<AppState>) {
    this.userSession$ = this.store.pipe(select(selectUserSession));
  }

  public logOutUser() {
    this.store.dispatch(authActions.logoutAction());
    this.store.dispatch(notificationsActions.closeConnectionAction());
  }
}
