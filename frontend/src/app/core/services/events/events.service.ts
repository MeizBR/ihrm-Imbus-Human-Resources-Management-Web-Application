import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { selectUserWorkspaceId } from '../../reducers/auth';

import { BaseHttpService } from '../base-http.service';

import { Event, PatchEvent, PostEvent } from '../../../generated/models';

import { EventDetails, mapEventToEventDetails } from '../../../shared/models/event-models/event-details';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private eventPath: string;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
    this.store.pipe(select(selectUserWorkspaceId)).subscribe((workspaceId: number) => {
      this.eventPath = `/workspaces/${workspaceId}/events`;
    });
  }

  public getEvents(): Observable<EventDetails[]> {
    return this.baseHttp.get<Event[]>(this.eventPath).pipe(map((data: Event[]) => data.map((event: Event) => mapEventToEventDetails(event))));
  }

  public getEventDetails(eventId: number): Observable<EventDetails> {
    return this.baseHttp
      .get<Event>(this.eventPath, { urlParams: eventId + '' })
      .pipe(map((data: Event) => mapEventToEventDetails(data)));
  }

  public postEvent(eventToAdd: PostEvent): Observable<EventDetails> {
    return this.baseHttp
      .post<Event>(this.eventPath, { payload: eventToAdd })
      .pipe(map((event: Event) => mapEventToEventDetails(event)));
  }

  public patchEvent(eventToUpdate: PatchEvent, id: number): Observable<EventDetails> {
    return this.baseHttp
      .patch<Event>(this.eventPath, { payload: eventToUpdate, urlParams: id + '' })
      .pipe(map((data: Event) => mapEventToEventDetails(data)));
  }

  public deleteEvent(eventId: number): Observable<string> {
    return this.baseHttp.delete<string>(this.eventPath, { urlParams: eventId + '' });
  }
}
