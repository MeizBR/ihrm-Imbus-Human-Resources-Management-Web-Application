import { Router } from '@angular/router';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-project-header',
  templateUrl: './project-header.component.html',
  styleUrls: ['./project-header.component.scss'],
})
export class ProjectHeaderComponent implements OnChanges {
  @Input() isProjectsPage: boolean;

  public selectedIndex = 1;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isProjectsPage']) {
      this.selectedIndex = this.isProjectsPage ? 0 : 1;
    }
  }

  public goToProjects(tabIndex: number): void {
    if (tabIndex === 0) {
      this.router.navigate(['/home/projects']);
    }
  }
}
