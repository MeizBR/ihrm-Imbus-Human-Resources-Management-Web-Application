import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select-item',
  templateUrl: './select-item.component.html',
  styleUrls: ['./select-item.component.scss'],
})
export class SelectItemComponent<T> {
  @Input() list: Array<T>;
  @Output() selectAction = new EventEmitter<number>();

  public searchKey: string;

  constructor() {}

  selectItem(id: number): void {
    this.selectAction.emit(id);
    if (id) {
      this.searchKey = '';
    }
  }
}
