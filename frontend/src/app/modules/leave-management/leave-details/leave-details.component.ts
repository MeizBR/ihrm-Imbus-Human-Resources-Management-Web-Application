import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { leavesActions } from '../../../core/reducers/leave/leave.actions';
import { isAdminGlobalRole, loggedUserId } from '../../../core/reducers/auth';
import { getLeavesError, getLeavesLoading, getSelectedLeaveDetails, getUserLeavesDetailsList } from '../../../core/reducers/leave';

import { ErrorType } from '../../../shared/validators';
import { LeaveDetails, LeaveToPut, LeaveToUpdate } from '../../../shared/models/index';

@Component({
  selector: 'app-leave-details',
  templateUrl: './leave-details.component.html',
  styleUrls: ['./leave-details.component.scss'],
})
export class LeaveDetailsComponent {
  private subscriptions$: Subscription[] = [];

  public leaveFromUrl: number;
  public allUsersLeaves: boolean;
  public currentUser$: Observable<number>;
  public isAdministrator$: Observable<boolean>;
  public allLeaves$: Observable<LeaveDetails[]>;
  public leaveDetails$: Observable<LeaveDetails>;
  public error$: Observable<ErrorType | undefined>;
  public isLeaveLoading$: Observable<boolean | undefined>;

  constructor(private store: Store<AppState>, private route: ActivatedRoute) {
    this.subscriptions$.push(this.route.params.subscribe(leaveId => (this.leaveFromUrl = parseInt(leaveId.leaveId, 10))));
    this.currentUser$ = this.store.pipe(select(loggedUserId));
    this.isAdministrator$ = this.store.pipe(select(isAdminGlobalRole));
    this.allLeaves$ = this.store.pipe(select(getUserLeavesDetailsList));
    this.leaveDetails$ = this.store.pipe(select(getSelectedLeaveDetails));
    this.error$ = this.store.pipe(select(getLeavesError));
    this.isLeaveLoading$ = this.store.pipe(select(getLeavesLoading));
  }

  ngOnDestroy(): void {
    this.subscriptions$.map(subscription => subscription.unsubscribe);
  }

  public putLeave(leaveToPut: { leave: LeaveToPut; leaveId: number }): void {
    this.store.dispatch(leavesActions.putLeaveStateAction({ leaveStatusUpdated: leaveToPut.leave, id: leaveToPut.leaveId }));
  }

  public updateLeave(leaveToUpdate: { leave: LeaveToUpdate; leaveId: number }): void {
    this.store.dispatch(leavesActions.updateLeaveAction({ leaveUpdated: leaveToUpdate.leave, id: leaveToUpdate.leaveId }));
  }
}
