import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';

import { TranslateService } from '@ngx-translate/core';

import { LeaveDetails } from '../../../../shared/models/index';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { CustomPaginator } from '../../../../shared/component/list-items/custom-paginator';

@Component({
  selector: 'app-all-leaves-card',
  templateUrl: './all-leaves-card.component.html',
  styleUrls: ['./all-leaves-card.component.scss'],
  providers: [{ provide: MatPaginatorIntl, useFactory: CustomPaginator, deps: [TranslateService] }],
})
export class AllLeavesCardComponent implements OnChanges {
  @Input() selectedLeaveId: number;
  @Input() onlyOwnLeaves: boolean;
  @Input() leaveList: LeaveDetails[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  public offset = 0;
  public pageSize = 10;
  public pageLength: number;
  public LeaveState = LeaveState;
  public splicedData: LeaveDetails[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['leaveList'] && this.leaveList) {
      this.pageLength = this.leaveList?.length;
      this.splicedData = this.leaveList?.slice(this.offset).slice(0, this.pageSize);
    }
  }

  public pageChangeEvent(event: PageEvent): void {
    this.offset = event.pageIndex * event.pageSize;
    this.splicedData = this.leaveList?.slice(this.offset).slice(0, event.pageSize);
  }

  public leaveTrackFn = (i: number, _: LeaveDetails) => i;

  public getSelectedPage(pageIndex: number) {
    // NOTE: setTimeout is used to resolve the 'ExpressionChangedAfterItHasBeenCheckedError' issue
    // TODO: Find another solution instead
    setTimeout(() => {
      this.paginator.pageIndex = pageIndex - 1;
      this.offset = pageIndex ? (pageIndex - 1) * this.pageSize : 0;
      this.splicedData = this.leaveList?.slice(this.offset).slice(0, this.pageSize);
    });
  }
}
