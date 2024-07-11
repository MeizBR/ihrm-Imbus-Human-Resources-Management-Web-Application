import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { projectActions } from '../../../core/reducers/project/project.actions';

@Injectable({
  providedIn: 'root',
})
export class CalendarsManagementGuard implements CanActivate {
  constructor(private store: Store<AppState>) {}

  canActivate(): boolean {
    // this.store.dispatch(calendarsActions.loadAllCalendarsAction());
    this.store.dispatch(projectActions.loadProjectAction());

    return true;
  }
}
