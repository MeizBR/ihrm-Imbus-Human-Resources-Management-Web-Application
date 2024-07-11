import { Router } from '@angular/router';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss'],
})
export class UserHeaderComponent implements OnChanges {
  @Input() isUsersPage: boolean;

  public selectedIndex = 1;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isUsersPage']) {
      this.selectedIndex = this.isUsersPage ? 0 : 1;
    }
  }

  public goToUsers(tabIndex: number): void {
    if (tabIndex === 0) {
      this.router.navigate(['/home/team']);
    }
  }
}
