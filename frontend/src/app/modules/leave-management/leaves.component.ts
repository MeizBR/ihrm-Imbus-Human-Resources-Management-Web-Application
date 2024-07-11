import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss'],
})
export class LeavesComponent {
  public isLeavesPage: boolean;

  constructor(private router: Router) {
    this.router.events.subscribe(nav => {
      if (nav instanceof NavigationEnd) {
        this.isLeavesPage = !this.router.url.includes('leaves/leave');
      }
    });
  }
}
