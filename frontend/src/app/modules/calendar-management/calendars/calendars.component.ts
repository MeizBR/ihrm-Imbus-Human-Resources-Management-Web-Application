import { Router } from '@angular/router';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CalendarOptions, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';

import { combineLatest } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { getEventsDetailsList } from '../../../core/reducers/event';
import { getFilteredLeavesList } from '../../../core/reducers/leave';
import { calendarsActions } from '../../../core/reducers/calendar/calendar.actions';
import { getCalendarsInFilters, getFilteredCalendars, getFilteredUsersLeaves, getUsersLeavesInFilters } from '../../../core/reducers/calendar';

import { HeaderToolbar } from '../../../shared/enum/headerToolbar.enum';
import { CalendarsListFilter, mapEventToEventInput, mapLeaveToEventInput, UsersLeavesFilter } from '../../../shared/models/index';

@Component({
  selector: 'app-calendars',
  templateUrl: './calendars.component.html',
  styleUrls: ['./calendars.component.scss'],
})
export class CalendarsComponent implements OnDestroy {
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  private subscription$: Subscription[] = [];

  public leavesFilterList: UsersLeavesFilter[];
  public eventsFilterList: CalendarsListFilter[];
  public calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: `${HeaderToolbar.Prev},${HeaderToolbar.Next} ${HeaderToolbar.Today}`,
      center: `${HeaderToolbar.Title}`,
      right: `${HeaderToolbar.DayGridMonth},${HeaderToolbar.TimeGridWeek},${HeaderToolbar.TimeGridDay},${HeaderToolbar.ListWeek}`,
    },
    initialView: `${HeaderToolbar.DayGridMonth}`,
    weekends: true,
    editable: false,
    selectable: false,
    selectMirror: true,
    dayMaxEvents: true,
    slotDuration: '01:00',
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    eventTimeFormat: { hour: '2-digit' },
    eventClick: (arg: EventClickArg) => this.handleEventClick(arg),
  };

  constructor(private router: Router, private store: Store<AppState>) {
    this.subscription$.push(
      this.store.pipe(select(getCalendarsInFilters)).subscribe(calendars => (this.eventsFilterList = calendars)),
      this.store.pipe(select(getUsersLeavesInFilters)).subscribe(usersLeaves => (this.leavesFilterList = usersLeaves)),
      combineLatest([
        this.store.pipe(select(getFilteredCalendars)),
        this.store.pipe(select(getEventsDetailsList)),
        this.store.pipe(select(getFilteredUsersLeaves)),
        this.store.pipe(select(getFilteredLeavesList)),
      ]).subscribe(([calendarsList, calendarEventsList, filteredUsersLeaves, filteredLeavesList]) => {
        const filteredCalendarEvents =
          calendarEventsList?.filter(event => calendarsList?.find(cal => cal.calendarId === event.calendarId && cal.isChecked)).map(event => mapEventToEventInput(event)) || [];

        const filteredCalendarLeaves =
          filteredLeavesList?.filter(leave => filteredUsersLeaves?.find(l => l.userId === leave.userId && l.isChecked)).map(leave => mapLeaveToEventInput(leave)) || [];

        this.calendarOptions.events = [...filteredCalendarEvents, ...filteredCalendarLeaves];
      }),
    );
  }

  private handleEventClick(clickInfo: EventClickArg): void {
    if (clickInfo.event.extendedProps.isClickable) {
      const route = clickInfo.event?.classNames.some(name => name.startsWith('event-'))
        ? '/home/events/event'
        : clickInfo.event?.classNames.some(name => name.startsWith('leave-'))
        ? '/home/leaves/leave'
        : '';

      if (!!route) {
        this.router.navigate([route, clickInfo.event.id]);
      }
    }
  }

  public calendarFilterChanged(filteredCalendar: CalendarsListFilter) {
    this.store.dispatch(calendarsActions.updateCalendarsFilterListAction({ updatedFilter: filteredCalendar }));
  }

  public leavesFilterChanged(usersLeaveFilter: UsersLeavesFilter) {
    this.store.dispatch(calendarsActions.updateUsersLeavesFilterListAction({ updatedFilter: usersLeaveFilter }));
  }

  public toggleAllCalendar(allSelect: boolean) {
    this.eventsFilterList.map(calendar => {
      this.store.dispatch(
        calendarsActions.updateCalendarsFilterListAction({
          updatedFilter: {
            calendarId: calendar.calendarId,
            calendarName: calendar.calendarName,
            isChecked: allSelect,
          },
        }),
      );
    });
  }

  public toggleAllLeaves(allSelect: boolean) {
    this.leavesFilterList.map(leave => {
      this.store.dispatch(
        calendarsActions.updateUsersLeavesFilterListAction({
          updatedFilter: {
            userId: leave.userId,
            userName: leave.userName,
            isChecked: allSelect,
          },
        }),
      );
    });
  }

  ngOnDestroy(): void {
    this.subscription$.map(subscription => subscription.unsubscribe);
  }
}
