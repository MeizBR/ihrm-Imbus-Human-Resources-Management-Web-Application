import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState } from '../../reducers';
import { selectUserSession, selectUserWorkspaceId } from './../../reducers/auth/index';

import { BaseHttpService } from '../base-http.service';

import { Activity } from '../../../generated/activity';
import { PatchActivity, PostActivity, UserSession } from '../../../generated/models';
import { ActivityDetails, mapActivityToActivityDetails } from '../../../shared/models/activity-models/activity-models-index';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  private workspaceId: number;
  private activityPath: string;
  private userSession: UserSession;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
    this.store.pipe(select(selectUserSession)).subscribe((userSession: UserSession) => {
      this.userSession = userSession;
    });

    this.store.pipe(select(selectUserWorkspaceId)).subscribe(workspaceId => {
      this.workspaceId = workspaceId;
      this.activityPath = `/workspaces/${workspaceId}/activities`;
    });
  }

  /** NOTE: To be used in the administration view */
  public getActivities(from?: string, to?: string): Observable<ActivityDetails[]> {
    const queryParam = {};
    // if (!this.userSession?.globalRoles.includes('Administrator')) {
    //   queryParam['userId'] = this.userSession?.userId;
    // }
    console.log(`${to}`);
    if (from) {
      queryParam['from'] = `"${from}"`;
    }
    if (to) {
      queryParam['to'] = `"${to}"`;

    }

    return this.baseHttp
      .get<Activity[]>(this.activityPath, { queryParams: queryParam })
      .pipe(map((data: Activity[]) => data.map((activity: Activity) => mapActivityToActivityDetails(activity))));
  }

  // public getSelfActivities(): Observable<ActivityDetails[]> {
  //   const queryParam = {};

  //   queryParam['userId'] = this.userSession?.userId;
  //   console.log("workspace: " + this.userSession?.workspaceId)
  //   console.log("user: " + this.userSession?.userId)

  //   return this.baseHttp
  //     .get<Activity[]>(`/workspaces/${this.workspaceId}/self/activities`, { queryParams: queryParam })
  //     .pipe(map((data: Activity[]) => data.map((activity: Activity) => mapActivityToActivityDetails(activity))));
  // }

  public getSelfActivities(from?: string, to?: string): Observable<ActivityDetails[]> {
    const queryParam = {};
    const userId = JSON.parse(localStorage.getItem('USER_SESSION')).userId;
    const workspaceId = JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    queryParam['userId'] = userId;
    if (from) {
      queryParam['from'] = `"${from}"`;
    }
    if (to) {
      queryParam['to'] = `"${to}"`;

    }
    return this.baseHttp
      .get<Activity[]>(`/workspaces/${workspaceId}/self/activities`, { queryParams: queryParam })
      .pipe(map((data: Activity[]) => data.map((activity: Activity) => mapActivityToActivityDetails(activity))));
  }

  public postActivity(activity: PostActivity): Observable<ActivityDetails> {
    return this.baseHttp
      .post<Activity>(this.activityPath, { payload: activity })
      .pipe(map((data: Activity) => mapActivityToActivityDetails(data)));
  }

  public patchActivity(activity: PatchActivity, id: number): Observable<ActivityDetails> {
    return this.baseHttp
      .patch<Activity>(this.activityPath, { payload: activity, urlParams: id + '' })
      .pipe(map((data: Activity) => mapActivityToActivityDetails(data)));
  }

  public deleteActivity(id: number): Observable<string> {
    return this.baseHttp
      .delete<string>(this.activityPath, { urlParams: id + '' })
      .pipe(map((data: string) => data));
  }
}
