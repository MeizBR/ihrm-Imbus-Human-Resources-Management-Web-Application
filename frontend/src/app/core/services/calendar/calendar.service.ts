import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { selectUserWorkspaceId } from '../../reducers/auth/index';

import { BaseHttpService } from '../base-http.service';

import { Calendar } from '../../../generated/calendar';
import { PostCalendar } from '../../../generated/postCalendar';
import { PatchCalendar } from '../../../generated/patchCalendar';

import { CalendarDetails, mapCalendarToCalendarDetails } from '../../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private workspaceId: number;
  private calendarPath: string;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
    this.store.pipe(select(selectUserWorkspaceId)).subscribe((workspaceId: number) => {
      this.workspaceId = workspaceId;
      this.calendarPath = `/workspaces/${workspaceId}/calendar`;
    });
  }

  // NOTE: getAllCalendars and getCalendarDetails return the same type `Calendar` and list of Calendar why we need it ?
  public getAllCalendars(): Observable<CalendarDetails[]> {
    return this.baseHttp
      .get<Calendar[]>(`/workspaces/${this.workspaceId}/calendars`)
      .pipe(map((calendarList: Calendar[]) => calendarList.map((calendar: Calendar) => mapCalendarToCalendarDetails(calendar))));
  }

  public getCalendarDetails(calendarId: number): Observable<CalendarDetails> {
    return this.baseHttp
      .get<Calendar>(this.calendarPath, { urlParams: calendarId + '' })
      .pipe(map((data: Calendar) => mapCalendarToCalendarDetails(data)));
  }

  public postCalendar(calendarToAdd: PostCalendar, projectId: number): Observable<CalendarDetails> {
    const queryParam = {};
    queryParam['projectId'] = projectId;

    return this.baseHttp
      .post<PostCalendar>(this.calendarPath, { queryParams: queryParam, payload: calendarToAdd })
      .pipe(map((calendar: Calendar) => mapCalendarToCalendarDetails(calendar)));
  }

  public patchCalendar(calendarId: number, calendarToUpdate: PatchCalendar): Observable<CalendarDetails> {
    return this.baseHttp
      .patch<Calendar>(this.calendarPath, { urlParams: calendarId + '', payload: calendarToUpdate })
      .pipe(map((data: Calendar) => mapCalendarToCalendarDetails(data)));
  }

  public deleteCalendar(calendarId: number): Observable<string> {
    return this.baseHttp.delete<string>(this.calendarPath, { urlParams: calendarId + '' });
  }
}
