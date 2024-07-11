import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { BaseHttpService } from '../base-http.service';

import { AppState } from '../../reducers';
import { selectUserWorkspaceId } from '../../reducers/auth/index';

import { Leave } from '../../../generated/leave';
import { PostLeave } from '../../../generated/postLeave';
import { PatchLeave, PutLeave } from '../../../generated/models';

import { LeaveDetails, mapLeaveToLeaveDetails } from '../../../shared/models/index';

@Injectable({
  providedIn: 'root',
})
export class LeavesService {
  private leavesPath: string;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
    this.store.pipe(select(selectUserWorkspaceId)).subscribe((workspaceId: number) => {
      this.leavesPath = `/workspaces/${workspaceId}/leaves`;
    });
  }

  public getLeaves(): Observable<LeaveDetails[]> {
    return this.baseHttp.get<Leave[]>(this.leavesPath).pipe(map((data: Leave[]) => data.map((leave: Leave) => mapLeaveToLeaveDetails(leave))));
  }

  public getOneLeave(id: number): Observable<LeaveDetails> {
    return this.baseHttp
      .get<Leave>(this.leavesPath, { urlParams: id + '' })
      .pipe(map((data: Leave) => mapLeaveToLeaveDetails(data)));
  }

  public addLeave(leave: PostLeave, userId?: number): Observable<LeaveDetails> {
    const queryParam = {};
    if (userId) {
      queryParam['userId'] = userId;
    }

    return this.baseHttp
      .post<Leave>(this.leavesPath, { payload: leave, queryParams: queryParam })
      .pipe(map((data: Leave) => mapLeaveToLeaveDetails(data)));
  }

  public patchLeaves(leave: PatchLeave, id: number): Observable<LeaveDetails> {
    return this.baseHttp
      .patch<Leave>(this.leavesPath, { payload: leave, urlParams: id + '' })
      .pipe(map((data: Leave) => mapLeaveToLeaveDetails(data)));
  }

  public putLeaveState(putLeave: PutLeave, id: number): Observable<LeaveDetails> {
    return this.baseHttp
      .put<Leave>(this.leavesPath, { payload: putLeave, urlParams: id + '' })
      .pipe(map((data: Leave) => mapLeaveToLeaveDetails(data)));
  }
}
