import { Router } from '@angular/router';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-leave-header',
  templateUrl: './leave-header.component.html',
  styleUrls: ['./leave-header.component.scss'],
})
export class LeaveHeaderComponent implements OnChanges {
  @Input() isLeavesList: boolean;

  public selectedIndex = 1;
  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLeavesList']) {
      this.selectedIndex = this.isLeavesList ? 0 : 1;
    }
  }

  public goToLeaves(tabIndex: number): void {
    if (tabIndex === 0) {
      this.router.navigate(['/home/leaves']);
    }
  }
}
