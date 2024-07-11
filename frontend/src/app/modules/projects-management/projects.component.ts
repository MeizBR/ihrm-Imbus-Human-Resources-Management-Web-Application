import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent {
  public isProjectsPage: boolean;

  constructor(private router: Router) {
    this.router.events.subscribe(nav => {
      if (nav instanceof NavigationEnd) {
        this.isProjectsPage = !this.router.url.includes('projects/details');
      }
    });
  }
}
