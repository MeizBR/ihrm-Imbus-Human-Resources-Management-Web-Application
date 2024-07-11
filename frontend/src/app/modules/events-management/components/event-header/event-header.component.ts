import { Router } from '@angular/router';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-event-header',
  templateUrl: './event-header.component.html',
  styleUrls: ['./event-header.component.scss'],
})
export class EventHeaderComponent implements OnChanges {
  @Input() isEventsListPage: boolean;

  public selectedIndex = 0;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEventsListPage']) {
      this.selectedIndex = this.isEventsListPage ? 0 : 1;
    }
  }

  public goToEvents(tabIndex: number): void {
    if (tabIndex === 0) {
      this.router.navigate(['/home/events']);
    }
  }
}
