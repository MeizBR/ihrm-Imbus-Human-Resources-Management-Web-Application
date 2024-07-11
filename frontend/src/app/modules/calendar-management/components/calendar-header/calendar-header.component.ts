import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar-header',
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
})
export class CalendarHeaderComponent {
  @Input() isCalendarsListPage: boolean;
  @Input() isCalendars: boolean;

  public selectedIndex = 1;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isCalendars'] || changes['isCalendarsListPage']) {
      this.selectedIndex = this.isCalendars ? 0 : this.isCalendarsListPage ? 1 : 2;
    }
  }

  public navigateFromTabs(tabIndex: number): void {
    if (tabIndex === 0) {
      this.router.navigate(['/home/calendars']);
    }
    if (tabIndex === 1) {
      this.router.navigate(['home/calendars/calendars-management']);
    }
  }
}
