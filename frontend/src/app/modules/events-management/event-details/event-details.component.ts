import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { eventsActions } from '../../../core/reducers/event/event.actions';
import { getEventCalendarsList, getEventsDetailedList, getSelectedEventDetails } from '../../../core/reducers/event';

import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { CalendarDetails, ConfirmDialogModel, EventDetails, EventToUpdate } from '../../../shared/models/index';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent implements OnDestroy {
  private subscriptions$: Subscription[] = [];

  public eventFromUrl: number;
  public allUsersLeaves: boolean;
  public eventDetails$: Observable<EventDetails>;
  public calendarsList$: Observable<CalendarDetails[]>;
  public allEvents$: Observable<EventDetails[] | undefined>;

  constructor(public dialog: MatDialog, private store: Store<AppState>, private route: ActivatedRoute) {
    this.eventDetails$ = this.store.pipe(select(getSelectedEventDetails));
    this.allEvents$ = this.store.pipe(select(getEventsDetailedList));
    this.calendarsList$ = this.store.pipe(select(getEventCalendarsList));
    this.subscriptions$.push(this.route.params.subscribe(eventIdFromUrl => (this.eventFromUrl = parseInt(eventIdFromUrl.eventId, 10))));
  }

  ngOnDestroy(): void {
    this.subscriptions$.map(subscription => subscription.unsubscribe);
  }

  public updateEvent(event: { eventToUpdate: EventToUpdate; calendarUpdated: boolean }): void {
    if (event.calendarUpdated) {
      const data: ConfirmDialogModel = { title: '', message: 'EVENTS_VIEW.EDIT_EVENT.PUBLIC_TO_PRIVATE_CAL' };
      const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });
      this.subscriptions$.push(
        dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
          if (dialogResult) {
            this.store.dispatch(eventsActions.updateEventAction({ eventToUpdate: event.eventToUpdate }));
          }
        }),
      );
    } else {
      this.store.dispatch(eventsActions.updateEventAction({ eventToUpdate: event.eventToUpdate }));
    }
  }

  public deleteEvent(id: number): void {
    const data: ConfirmDialogModel = { title: 'DELETE_TITLE', message: 'DELETE_MESSAGE' };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '600px', data });
    const subscribeDialog = dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.store.dispatch(eventsActions.deleteEventAction({ id }));
      }
    });
    dialogRef.afterClosed().subscribe(_ => subscribeDialog.unsubscribe());
  }
}
