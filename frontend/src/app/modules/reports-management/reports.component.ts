import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  public isReportsSummaryPage: boolean;
  public isReportDetailedPage: boolean;
  public isReportWeeklyPage: boolean;

  constructor(private router: Router) {
    this.router.events.subscribe(nav => {
      if (nav instanceof NavigationEnd) {
        this.isReportsSummaryPage = this.router.url.includes('reports/summary');
        this.isReportDetailedPage = this.router.url.includes('reports/detailed');
        this.isReportWeeklyPage = this.router.url.includes('reports/weekly');
      }
    });
  }

  ngOnInit(): void {

  }
}
