import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { Observable } from 'rxjs';

import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { cold, hot } from 'jasmine-marbles';

import { reducers } from '../..';
import { LeaveEffects } from '../leave.effects';
import { leavesActions } from '../leave.actions';

import { LeavesService } from '../../../services/leaves/leaves.service';
import { NotificationService } from '../../../services/notification.service';

import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

import { ErrorType } from '../../../../shared/validators';
import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { LeaveDetails, LeaveToAdd, LeaveToUpdate } from '../../../../shared/models';

describe('Leave Effects', () => {
  // tslint:disable:no-any
  let actions: Observable<any>;
  let effects: LeaveEffects;
  let leavesService: jasmine.SpyObj<LeavesService>;

  const leaveA = {
    id: 1,
    calendarId: 1,
    start: new Date(2020, 8, 1),
    isHalfDayStart: true,
    end: new Date(2020, 8, 5),
    isHalfDayEnd: true,
    userId: 1,
    leaveType: LeaveType.Holiday,
    description: '',
    state: LeaveState.Pending,
    comment: '',
    userName: 'Doe John',
    calendarName: 'Calendar N°1',
  };
  const leaveB = {
    id: 2,
    calendarId: 2,
    start: new Date(2021, 9, 2),
    isHalfDayStart: false,
    end: new Date(2021, 9, 3),
    isHalfDayEnd: true,
    userId: 2,
    leaveType: LeaveType.Sick,
    description: '',
    state: LeaveState.InProgress,
    comment: '',
    userName: 'Joe Jackie',
    calendarName: 'Calendar N°2',
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        AngularMaterialModule,
      ],
      providers: [
        LeaveEffects,
        provideMockActions(() => actions),
        { provide: NotificationService, useValue: { success: () => {}, warn: () => {} } },
        { provide: LeavesService, useValue: jasmine.createSpyObj('leavesService', ['getLeaves', 'getOneLeave', 'addLeave', 'patchLeaves', 'putLeaveState']) },
      ],
    });
    effects = TestBed.inject(LeaveEffects);
    leavesService = TestBed.inject(LeavesService) as jasmine.SpyObj<LeavesService>;
  });

  describe('load leaves list', () => {
    it('should return a stream with loadAllLeavesActionSuccess action', () => {
      const action = leavesActions.loadAllLeavesAction();
      const outcome = leavesActions.loadAllLeavesActionSuccess({ leavesList: [leaveA, leaveB] });
      actions = hot('-a', { a: action });
      leavesService.getLeaves.and.returnValue(cold('-a', { a: [leaveA, leaveB] }));

      expect(effects.loadAllLeaves$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('load selected leave', () => {
    it('should return a stream with loadLeaveDetailsActionSuccess action', () => {
      const action = leavesActions.loadLeaveDetailsAction({ leaveId: 1 });
      const outcome = leavesActions.loadLeaveDetailsActionSuccess({ leave: leaveA });
      actions = hot('-a', { a: action });
      leavesService.getOneLeave.and.returnValue(cold('-a', { a: leaveA }));

      expect(effects.loadOwnLeave$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('add leave', () => {
    const leaveToAdd: LeaveToAdd = {
      start: new Date(2021, 9, 2).toString(),
      isHalfDayStart: false,
      end: new Date(2021, 9, 3).toString(),
      isHalfDayEnd: true,
      leaveType: LeaveType.Sick,
      description: '',
      state: LeaveState.InProgress,
    };
    it('should return a stream with addLeaveActionSuccess action', () => {
      const action = leavesActions.addLeaveAction({ leave: leaveToAdd, userId: 2 });
      const outcome = leavesActions.addLeaveActionSuccess({ leave: leaveB });
      actions = hot('-a', { a: action });
      leavesService.addLeave.and.returnValue(cold('-a|', { a: leaveB }));

      expect(effects.addLeave$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('update leave', () => {
    const leaveToUpdate: LeaveToUpdate = {
      start: new Date(2021, 9, 2).toString(),
      isHalfDayStart: false,
      end: new Date(2021, 9, 3).toString(),
      isHalfDayEnd: true,
      leaveType: LeaveType.Sick,
      description: 'New description',
    };
    it('should return a stream with updateLeaveActionSuccess action', () => {
      const action = leavesActions.updateLeaveAction({ leaveUpdated: leaveToUpdate, id: 2 });
      const outcome = leavesActions.updateLeaveActionSuccess({ leave: { ...leaveB, description: 'New description' } });
      actions = hot('-a', { a: action });
      leavesService.patchLeaves.and.returnValue(cold('-a|', { a: { ...leaveB, description: 'New description' } }));

      expect(effects.updateLeave$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('put leave state', () => {
    const leaveUpdated: LeaveDetails = { ...leaveB, description: 'New description' };
    it('should return a stream with updateLeaveActionSuccess action', () => {
      const action = leavesActions.putLeaveStateAction({ leaveStatusUpdated: { state: LeaveState.Pending, comment: '' }, id: 1 });
      const outcome = leavesActions.updateLeaveActionSuccess({ leave: leaveUpdated });
      actions = hot('-a', { a: action });
      leavesService.putLeaveState.and.returnValue(cold('-a|', { a: leaveUpdated }));

      expect(effects.putLeaveState$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('leave management failure', () => {
    it('should return a notification', () => {
      const action = leavesActions.leaveManagementFailedAction({ withSnackBarNotification: true, errorType: ErrorType.LeaveWithSameDateExists });
      actions = hot('-a', { a: action });
      expect(effects.leaveManagementFailed$).toBeObservable(cold('-b', { b: action }));
    });
  });
});
