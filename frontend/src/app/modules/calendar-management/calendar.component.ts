import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  public isCalendarsListPage = true;
  public isCalendars = true;

  constructor(private router: Router) {
    this.router.events.subscribe(nav => {
      if (nav instanceof NavigationEnd) {
        this.isCalendarsListPage = this.router.url.endsWith('calendars-management');
        this.isCalendars = this.router.url.endsWith('calendars');
      }
    });
  }
}
