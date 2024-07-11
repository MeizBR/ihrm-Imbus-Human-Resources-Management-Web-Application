import { Router } from '@angular/router';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-reports-header',
  templateUrl: './reports-header.component.html',
  styleUrls: ['./reports-header.component.scss']
})
export class ReportsHeaderComponent implements OnInit {
  @Input() isReportsSummary: boolean;
  @Input() isReportsDetailed: boolean;
  @Input() isReportsWeekly: boolean;

  public selectedIndex = 1;
  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isReportsSummary'] || changes['isReportsDetailed'] || changes['isReportsWeekly']) {
      this.selectedIndex = this.isReportsSummary ? 0 : this.isReportsDetailed ? 1 : 2;
    }
  }

  public navigateFromTabs(tabIndex: number): void {
    if(tabIndex === 0) {
      this.router.navigate(['/home/reports/summary']);
    }
    
    if(tabIndex === 1) {
      this.router.navigate(['/home/reports/detailed']);
    }

    if(tabIndex === 2) {
      this.router.navigate(['/home/reports/weekly']);
    }

    console.log("tabIndex: ", tabIndex);
  }

  ngOnInit(): void {
  }

}
