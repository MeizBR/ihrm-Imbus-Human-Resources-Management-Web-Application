import { StoreModule } from '@ngrx/store';
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { Observable } from 'rxjs';

import { provideMockActions } from '@ngrx/effects/testing';

import { cold, hot } from 'jasmine-marbles';

import { reducers } from '../..';
import { ActivityEffects } from '../activity.effects';
import { activityActions } from '../activity.actions';

import { NotificationService } from '../../../services/notification.service';
import { ActivitiesService } from '../../../services/activities/activities.service';

import { ActivityDetails, ActivityForAdd, ActivityForUpdate } from '../../../../shared/models/activity-models/activity-models-index';

describe('Activity effects', () => {
  // tslint:disable:no-any
  let actions: Observable<any>;
  let effects: ActivityEffects;
  let activitiesService: jasmine.SpyObj<ActivitiesService>;
  const activityA: ActivityDetails = {
    id: 1,
    userId: 1,
    projectId: 1,
    description: 'Task-01',
    start: '22-06-2021',
    end: '22-06-2021',
    projectName: 'Project A1',
    workDuration: '1:00:00',
  };
  const activityB: ActivityDetails = {
    id: 2,
    userId: 1,
    projectId: 2,
    description: 'Task-02',
    start: '22-06-2021',
    end: '22-06-2021',
    projectName: 'Project B1',
    workDuration: '2:00:00',
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
      ],
      providers: [
        ActivityEffects,
        provideMockActions(() => actions),
        { provide: NotificationService, useValue: { success: () => {}, warn: () => {} } },
        { provide: ActivitiesService, useValue: jasmine.createSpyObj('activitiesService', ['getActivities', 'postActivity', 'patchActivity', 'deleteActivity']) },
      ],
    });
    effects = TestBed.inject(ActivityEffects);
    // FIXME: @Hejer: never user deprecated methods
    // tslint:disable-next-line:deprecation
    activitiesService = TestBed.get(ActivitiesService);
  });

  describe('Load activities list', () => {
    it('Should return a stream with loadActivitySuccessAction action', () => {
      const activitiesList: ActivityDetails[] = [activityA, activityB];
      const action = activityActions.loadActivityAction({ userId: 1 });
      const outcome = activityActions.loadActivitySuccessAction({ activitiesList });
      actions = hot('-a', { a: action });
      activitiesService.getActivities.and.returnValue(cold('-a', { a: activitiesList }));

      expect(effects.loadActivities$).toBeObservable(cold('--b', { b: outcome }));
    });

    it('Should return a stream with loadActivityFailedAction action', () => {
      const action = activityActions.loadActivityAction({ userId: 1 });
      const outcome = activityActions.loadActivityFailedAction();
      actions = hot('-a', { a: action });
      activitiesService.getActivities.and.returnValue(cold('-#|', {}, ''));

      expect(effects.loadActivities$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('Add activity', () => {
    // FIXME: @Hejer: i tried to add an activity without description but it's not permitted the description field is required, but t can be empty when executing the app
    const activityToAdd: ActivityForAdd = { userId: 2, projectId: 3, description: 'Task-03' };

    it('Should return a stream with addActivitySuccessAction action', () => {
      const action = activityActions.addActivityAction({ activity: activityToAdd, currentState: 'started' });
      const outcome = activityActions.addActivitySuccessAction({
        activity: { id: 3, userId: 2, projectId: 3, description: 'Task-03', start: '22-06-2021' },
        currentState: 'started',
      });
      actions = hot('-a', { a: action });
      activitiesService.postActivity.and.returnValue(cold('-a|', { a: { id: 3, userId: 2, projectId: 3, description: 'Task-03', start: '22-06-2021' } }));

      expect(effects.addActivity$).toBeObservable(cold('--b', { b: outcome }));
    });

    it('Should return a stream with addActivityFailedAction action', () => {
      const action = activityActions.addActivityAction({ activity: activityToAdd, currentState: 'started' });
      const outcome = activityActions.addActivityFailedAction();
      actions = hot('-a', { a: action });
      activitiesService.postActivity.and.returnValue(cold('-#|', {}, ''));

      expect(effects.addActivity$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('Update activity', () => {
    const activityToUpdate: ActivityForUpdate = { id: 1, projectId: 1, description: 'Task-01', end: '22-06-2021' };
    it('Should return a stream with updateActivitySuccessAction action', () => {
      const action = activityActions.updateActivityAction({ activity: activityToUpdate, currentState: 'stopped' });
      const outcome = activityActions.updateActivitySuccessAction({ activity: activityA, currentState: 'stopped' });
      actions = hot('-a', { a: action });
      activitiesService.patchActivity.and.returnValue(cold('-a|', { a: activityA }));

      expect(effects.updateActivity$).toBeObservable(cold('--b', { b: outcome }));
    });

    it('Should return a stream with updateActivityFailedAction action', () => {
      const action = activityActions.updateActivityAction({ activity: activityToUpdate, currentState: 'stopped' });
      const outcome = activityActions.updateActivityFailedAction();
      actions = hot('-a', { a: action });
      activitiesService.patchActivity.and.returnValue(cold('-#|', {}, ''));

      expect(effects.updateActivity$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('Delete activity', () => {
    it('Should return a stream with deleteActivitySuccessAction action', () => {
      const action = activityActions.deleteActivityAction({ id: 1, current: 'stopped' });
      const outcome = activityActions.deleteActivitySuccessAction({ id: 1, current: 'stopped' });
      actions = hot('-a', { a: action });
      activitiesService.deleteActivity.and.returnValue(cold('-a|', { a: '' }));

      expect(effects.deleteActivity$).toBeObservable(cold('--b', { b: outcome }));
    });

    it('Should return a stream with deleteActivityFailedAction action', () => {
      const action = activityActions.deleteActivityAction({ id: 1, current: 'stopped' });
      const outcome = activityActions.deleteActivityFailedAction();
      actions = hot('-a', { a: action });
      activitiesService.deleteActivity.and.returnValue(cold('-#|', {}, ''));

      expect(effects.deleteActivity$).toBeObservable(cold('--b', { b: outcome }));
    });
  });
});
