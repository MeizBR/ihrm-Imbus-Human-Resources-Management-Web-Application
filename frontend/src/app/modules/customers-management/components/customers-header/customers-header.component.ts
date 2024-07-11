import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customers-header',
  templateUrl: './customers-header.component.html',
  styleUrls: ['./customers-header.component.scss'],
})
export class CustomersHeaderComponent implements OnChanges {
  @Input() isCustomersPage: boolean;

  public selectedIndex = 1;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isCustomersPage']) {
      this.selectedIndex = this.isCustomersPage ? 0 : 1;
    }
  }

  public goToCustomers(tabIndex: number): void {
    if (tabIndex === 0) {
      this.router.navigate(['/home/customers']);
    }
  }
}
