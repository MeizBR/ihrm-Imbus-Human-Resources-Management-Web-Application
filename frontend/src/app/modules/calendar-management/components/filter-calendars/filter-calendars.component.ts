import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { getNoItemsMsg } from '../../calendar-helpers';
import { CalendarsListFilter, UsersLeavesFilter } from '../../../../shared/models/index';

@Component({
  selector: 'app-filter-calendars',
  templateUrl: './filter-calendars.component.html',
  styleUrls: ['./filter-calendars.component.scss'],
})
export class FilterCalendarsComponent implements OnChanges {
  @Input() eventsFilterList: CalendarsListFilter[];
  @Input() leavesFilterList: UsersLeavesFilter[];

  @Output() allLeavesToggled = new EventEmitter<boolean>();
  @Output() allCalendarsToggled = new EventEmitter<boolean>();
  @Output() calendarFiltersChanged = new EventEmitter<CalendarsListFilter>();
  @Output() usersLeavesFilterChanged = new EventEmitter<UsersLeavesFilter>();

  public noItemMsg: string;
  public allLeavesSelected: boolean;
  public allCalendarsSelected: boolean;
  public filters: CalendarsListFilter[] = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['eventsFilterList'] && this.eventsFilterList) || (changes['leavesFilterList'] && this.leavesFilterList)) {
      this.allCalendarsSelected = this.eventsFilterList?.every(cal => cal?.isChecked);
      this.allLeavesSelected = this.leavesFilterList?.every(leave => leave?.isChecked);
      this.noItemMsg = getNoItemsMsg(this.eventsFilterList?.length, this.leavesFilterList?.length);
    }
  }

  public someCompletedCalendars(): boolean {
    return this.eventsFilterList?.filter(cal => cal.isChecked).length > 0 && !this.allCalendarsSelected;
  }

  public someCompletedLeaves(): boolean {
    return this.leavesFilterList?.filter(leave => leave.isChecked).length > 0 && !this.allLeavesSelected;
  }

  public checkedCalendarChanged(calendarId: number, toggleEvent?: boolean) {
    this.calendarFiltersChanged.emit({ calendarId: calendarId, isChecked: toggleEvent });
  }

  public checkedUserLeavesChanged(userId: number, toggleLeave?: boolean) {
    this.usersLeavesFilterChanged.emit({ userId: userId, isChecked: toggleLeave });
  }

  public toggleAllCalendar() {
    this.allCalendarsSelected = !this.allCalendarsSelected;
    this.allCalendarsToggled.emit(this.allCalendarsSelected);
  }

  public toggleAllLeaves() {
    this.allLeavesSelected = !this.allLeavesSelected;
    this.allLeavesToggled.emit(this.allLeavesSelected);
  }

  public trackLeaves = (i: number, _: UsersLeavesFilter) => i;
  public trackCalendars = (i: number, _: CalendarsListFilter) => i;
}
