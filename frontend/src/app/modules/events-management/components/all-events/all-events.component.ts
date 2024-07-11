import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { EventDetails } from '../../../../shared/models/event-models/event-details';

@Component({
  selector: 'app-all-events',
  templateUrl: './all-events.component.html',
  styleUrls: ['./all-events.component.scss'],
})
export class AllEventsComponent implements OnChanges {
  @Input() selectedEventId: number;
  @Input() eventList: EventDetails[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  public offset = 0;
  public pageSize = 9;
  public pageLength: number;
  public splicedData: EventDetails[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventList'] && this.eventList) {
      this.pageLength = this.eventList?.length;
      this.splicedData = this.eventList?.slice(this.offset).slice(0, this.pageSize);
    }
  }

  public pageChangeEvent(event: PageEvent): void {
    this.offset = event.pageIndex * event.pageSize;
    this.splicedData = this.eventList?.slice(this.offset).slice(0, event.pageSize);
  }

  public dataTrackFn = (index: number, _: EventDetails) => index;

  public getSelectedPage(pageIndex: number) {
    this.paginator.pageIndex = pageIndex - 1;
    this.offset = pageIndex ? (pageIndex - 1) * this.pageSize : 0;
    this.splicedData = this.eventList?.slice(this.offset).slice(0, this.pageSize);
  }
}
