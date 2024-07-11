import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { CalendarDetails } from '../../../../shared/models';

@Component({
  selector: 'app-all-calendars',
  templateUrl: './all-calendars.component.html',
  styleUrls: ['./all-calendars.component.scss'],
})
export class AllCalendarsComponent implements OnChanges {
  @Input() selectedCalendarId: number;
  @Input() calendarsList: CalendarDetails[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  public offset = 0;
  public pageSize = 10;
  public pageLength: number;
  public splicedData: CalendarDetails[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['calendarsList'] && this.calendarsList) {
      this.pageLength = this.calendarsList.length;
      this.splicedData = this.calendarsList.slice(this.offset).slice(0, this.pageSize);
    }
  }

  public pageChangeEvent(event: PageEvent): void {
    this.offset = event.pageIndex * event.pageSize;
    this.splicedData = this.calendarsList?.slice(this.offset).slice(0, event.pageSize);
  }

  public calendarTrackFn = (i: number, _: CalendarDetails) => i;

  public getSelectedPage(pageIndex: number) {
    this.paginator.pageIndex = pageIndex - 1;
    this.offset = pageIndex ? (pageIndex - 1) * this.pageSize : 0;
    this.splicedData = this.calendarsList?.slice(this.offset).slice(0, this.pageSize);
  }
}
