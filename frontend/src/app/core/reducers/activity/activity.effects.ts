import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { EMPTY, of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { activityActions } from './activity.actions';

import { NotificationService } from '../../services/notification.service';
import { ActivitiesService } from '../../services/activities/activities.service';

import { extractActivityErrorMessage } from '../../../modules/activity-management/helpers/activity-.helper';

import { CurrentActivityState } from '../../../shared/enum/current-activity-state.enum';
import { mapToPatchActivity, mapToPostActivity } from '../../../shared/models/activity-models/activity-info-data';

@Injectable()
export class ActivityEffects {
  loadActivities$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(activityActions.loadActivityAction),
      switchMap((action: { from?: string, to?: string }) =>
        this.activitiesService.getActivities(action.from, action.to).pipe(
          map(activities => activityActions.loadActivitySuccessAction({ activitiesList: activities })),
    catchError((error: HttpErrorResponse) => {
            this.notificationService.warn(extractActivityErrorMessage(error));

            return of(activityActions.loadActivityFailedAction());
          }),
        ),
      ),
    );
  });

  loadSelfActivities$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(activityActions.loadSelfActivityAction),
      switchMap((action: { from?: string, to?: string })  =>
        this.activitiesService.getSelfActivities(action.from, action.to).pipe(
          map(activities => activityActions.loadSelfActivitySuccessAction({ selfActivitiesList: activities })),

          catchError((error: HttpErrorResponse) => {
            this.notificationService.warn(extractActivityErrorMessage(error));

            return of(activityActions.loadActivityFailedAction());
          }),
        ),
      ),
    );
  });

  addActivity$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(activityActions.addActivityAction),
      switchMap(action => {
        if (action.currentState === CurrentActivityState.restarted && !action.activity?.restartActivityPermission) {
          this.notificationService.warn(`You're no longer a member of this project !!`);

          return EMPTY;
        } else {
          return this.activitiesService.postActivity(mapToPostActivity(action.activity)).pipe(
            map(activity => activityActions.addActivitySuccessAction({ activity: activity, currentState: action.currentState })),
            catchError((error: HttpErrorResponse) => {
              this.notificationService.warn(extractActivityErrorMessage(error));

              return of(activityActions.addActivityFailedAction());
            }),
          );
        }
      }),
    );
  });

  updateActivity$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(activityActions.updateActivityAction),
      concatMap(action =>
        this.activitiesService.patchActivity(mapToPatchActivity(action.activity), action.activity.id).pipe(
          map(activity => {
            this.notificationService.success('Updated successfully');

            return activityActions.updateActivitySuccessAction({ activity: activity, currentState: action.currentState ? action.currentState : '' });
          }),
          catchError((error: HttpErrorResponse) => {
            this.notificationService.warn(extractActivityErrorMessage(error));

            return of(activityActions.updateActivityFailedAction());
          }),
        ),
      ),
    );
  });

  deleteActivity$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(activityActions.deleteActivityAction),
      concatMap(action => {
        return this.activitiesService.deleteActivity(action.id).pipe(
          map(_ => {
            this.notificationService.success('Deleted successfully');

            return activityActions.deleteActivitySuccessAction({ id: action.id, current: action.current });
          }),

          catchError((error: HttpErrorResponse) => {
            this.notificationService.warn(extractActivityErrorMessage(error));

            return of(activityActions.deleteActivityFailedAction());
          }),
        );
      }),
    );
  });

  constructor(private actions$: Actions, private activitiesService: ActivitiesService, private notificationService: NotificationService) {}
}
