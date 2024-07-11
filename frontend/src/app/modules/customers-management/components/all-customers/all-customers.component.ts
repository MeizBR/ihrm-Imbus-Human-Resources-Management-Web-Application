import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { CustomerDetailedPermissions, CustomerDetails } from '../../../../shared/models/customer-models/customerDetails';

@Component({
  selector: 'app-all-customers',
  templateUrl: './all-customers.component.html',
  styleUrls: ['./all-customers.component.scss'],
})
export class AllCustomersComponent implements OnChanges {
  @Input() customers: CustomerDetailedPermissions[];
  @Input() selectedCustomerId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  public offset = 0;
  public pageSize = 6;
  public pageLength: number;
  public splicedData: CustomerDetailedPermissions[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customers'] && this.customers) {
      this.pageLength = this.customers?.length;
      this.splicedData = this.customers.slice(this.offset).slice(0, this.pageSize);
    }
  }

  public pageChangeEvent(event: PageEvent): void {
    this.offset = event.pageIndex * event.pageSize;
    this.splicedData = this.customers?.slice(this.offset).slice(0, event.pageSize);
  }

  public getSelectedPage(pageIndex: number) {
    this.paginator.pageIndex = pageIndex - 1;
    this.offset = pageIndex ? (pageIndex - 1) * this.pageSize : 0;
    this.splicedData = this.customers?.slice(this.offset).slice(0, this.pageSize);
  }

  public customerTrackFn = (i: number, _: CustomerDetails) => i;
}
