import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy } from '@angular/core';

import * as lodash from 'lodash';
import * as moment from 'moment';

import { Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';
import { AppState } from '../../core/reducers';
import { loggedUserId } from '../../core/reducers/auth';
import { selectOwnProjectsList } from '../../core/reducers/project';
import { TimerService } from '../../core/services/activities/timer.service';
import { activityActions } from '../../core/reducers/activity/activity.actions';
import { getCurrentActivity, getDetailedSelfActivitiesList } from '../../core/reducers/activity';

import { getTotalDuration } from './helpers/activity-.helper';

import { DateFormat, TimeFormat } from './../../shared/enum/interval.enum';
import { CurrentActivityState } from '../../shared/enum/current-activity-state.enum';
import { ConfirmDialogComponent } from '../../shared/component/confirm-dialog/confirm-dialog.component';
import { ActivityDetails, ActivityForAdd, ActivityForUpdate, ConfirmDialogModel, ProjectDetails } from '../../shared/models/index';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnDestroy {
  public userId: number;
  public isCurrent = false;
  public projects: ProjectDetails[];
  public selectedProject: ProjectDetails;
  public currentActivity: ActivityDetails;
  public allActivities: ActivityDetails[];
  private subscription$: Subscription[] = [];
  public currentSelectedProject: ProjectDetails;
  public daysOfActivities: string[] | undefined;
  public currentTime: string | TimeFormat = TimeFormat.EmptyTimeLabel;
  public activitiesByDay: lodash.Dictionary<{ activities: ActivityDetails[]; totalWork: string }> = {};

  constructor(private store: Store<AppState>, private dialog: MatDialog, private timerService: TimerService) {
    this.subscription$.push(
      this.store.pipe(select(loggedUserId)).subscribe(userId => (this.userId = userId)),
      this.store.pipe(select(selectOwnProjectsList)).subscribe(projects => (this.projects = projects)),
      this.store.pipe(select(getCurrentActivity)).subscribe(currentActivity => {
        this.currentSelectedProject = currentActivity ? undefined : this.currentSelectedProject;
        this.currentActivity = currentActivity;
      }),

      this.timerService.getTimer().subscribe(timer => (this.currentTime = timer)),

      this.store.pipe(select(getDetailedSelfActivitiesList)).subscribe(selfActivitiesList => {
        const newActivitiesByDay = lodash.groupBy(selfActivitiesList && selfActivitiesList.sort((a, b) => (a.start < b.start ? 1 : -1)), (item: ActivityDetails) =>
          moment(item.start).format(DateFormat.FullDate),
        );
        // NOTE: to avoid displaying the empty message . daysOfActivities should be `undefined` not [] (work around until implementing is loading on activity state)
        this.daysOfActivities = Object.keys(newActivitiesByDay).length ? Object.keys(newActivitiesByDay) : undefined;
        this.daysOfActivities?.forEach(day => {
          this.activitiesByDay[day] = {
            activities: newActivitiesByDay[day],
            totalWork: getTotalDuration(newActivitiesByDay[day].map((activity: ActivityDetails) => activity.workDuration)),
          };
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription$.map(sub => sub.unsubscribe());
  }

  public restartActivity(activity: ActivityForAdd): void {
    if (this.currentActivity && activity.restartActivityPermission) {
      this.stopCurrentActivity();
    }
    this.store.dispatch(activityActions.addActivityAction({ activity: activity, currentState: CurrentActivityState.restarted }));
  }

  public startActivity(activityForAdd: ActivityForAdd): void {
    this.store.dispatch(activityActions.addActivityAction({ activity: activityForAdd, currentState: CurrentActivityState.started }));
  }

  public stopCurrentActivity(description?: string): void {
    const activityToPatch: ActivityForUpdate = { id: this.currentActivity?.id, end: new Date().toISOString(), description: description ?? this.currentActivity?.description };
    this.store.dispatch(activityActions.updateActivityAction({ activity: activityToPatch, currentState: CurrentActivityState.stopped }));
  }

  public deleteActivity(id: number, currentState?: string): void {
    const data: ConfirmDialogModel = { title: 'DELETE_TITLE', message: 'DELETE_MESSAGE' };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.store.dispatch(activityActions.deleteActivityAction({ id: id, current: currentState ? currentState : '' }));
      }
    });
  }
  public updateActivity(activityToUpdate: ActivityForUpdate): void {
    this.store.dispatch(activityActions.updateActivityAction({ activity: activityToUpdate }));
  }
  public onSelectCurrentProject(id: number, activityId: number): void {
    this.currentSelectedProject = this.projects.find(project => project.id === id);
    let activityToPatch: ActivityForUpdate = { id: activityId, projectId: this.currentSelectedProject.id };
    if (activityId) {
      activityToPatch = { ...activityToPatch, projectId: this.currentSelectedProject.id };
      this.store.dispatch(activityActions.updateActivityAction({ activity: activityToPatch }));
    }
  }
  public onSelectProject(id: number, activityId: number): void {
    this.selectedProject = this.projects.find(project => project.id === id);
    let activityToPatch: ActivityForUpdate = { id: activityId, projectId: this.selectedProject.id };
    if (activityId) {
      activityToPatch = { ...activityToPatch, projectId: this.selectedProject.id };
      this.store.dispatch(activityActions.updateActivityAction({ activity: activityToPatch }));
    }
  }
}
