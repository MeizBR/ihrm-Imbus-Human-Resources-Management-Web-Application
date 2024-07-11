import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent {
  public isEventsListPage = true;

  constructor(private router: Router) {
    this.router.events.subscribe(nav => {
      if (nav instanceof NavigationEnd) {
        this.isEventsListPage = !this.router.url.includes('events/event');
      }
    });
  }
}
