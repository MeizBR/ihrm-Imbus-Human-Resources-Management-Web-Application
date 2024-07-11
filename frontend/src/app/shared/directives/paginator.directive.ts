import { Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CalendarDetails, CustomerDetails, LeaveDetails, ProjectDetails, UserDetails } from '../models';

@Directive({
  selector: '[appPaginator]',
})
export class PaginatorDirective implements OnChanges {
  @Input() itemsPerPage: number;
  @Input() selectedItemId: number;
  @Input() itemList: UserDetails[] | ProjectDetails[] | LeaveDetails[] | CustomerDetails[] | CalendarDetails[];
  @Output() onChangeSelectedPage = new EventEmitter<number>();

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemList'] || changes['itemsPerPage'] || changes['selectedItemId']) {
      let slicedItems = [[]];

      this.itemList?.forEach((_, index) => {
        slicedItems =
          index * this.itemsPerPage < this.itemList?.length ? [...slicedItems, this.itemList.slice(index * this.itemsPerPage).slice(0, this.itemsPerPage)] : slicedItems;
      });
      this.onChangeSelectedPage.emit(slicedItems?.findIndex(item => item.find(i => i.id === this.selectedItemId)));
    }
  }
}
