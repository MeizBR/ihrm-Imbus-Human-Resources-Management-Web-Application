import { Component, Input, OnChanges , OnInit, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ActivityDetails } from '../../../shared/models';
import { AppState } from '../../../core/reducers';
import { getActivitiesList } from '../../../core/reducers/activity';
import { getDurationFormat, getTotalDurationInMilliseconds } from '../../activity-management/helpers/activity-.helper';
import { TimeFormat } from '../../../shared/enum/interval.enum';
import * as lodash from 'lodash';
import * as moment from 'moment/moment';

@Component({
  selector: 'app-charts-component',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],

})
export class ChartsComponent implements OnInit {
  @Input() selectedDates: string[];

  public projectsOfActivities: string[] = [];
  public activitiesByProject: lodash.Dictionary<{customer: string;  totalWork: number }> = {};
  public customerOfActivities: string[] = [];
  public activitiesByCustomer: lodash.Dictionary<{ activities: ActivityDetails[]; totalWork: number }> = {};
  public chartData: any[];
  public customerWithMaxTotalWork: string;
  public projectWithMaxTotalWork: string;
  public totalDuration: string;

  constructor(private store: Store<AppState>) {
  }

  ngOnInit(): void {
    this.store.pipe(select(getActivitiesList)).subscribe(activities => {
      if (activities) {
      this.processActivities(activities) ; }}
  );

  }

  private processActivities(activities: ActivityDetails[]): void {
    if (activities ) {
      const newActivitiesByProject = lodash.groupBy(activities, (item: ActivityDetails) => item.projectName);
      this.projectsOfActivities = Object.keys(newActivitiesByProject);
      this.projectsOfActivities.forEach(project => {
        this.activitiesByProject[project] = {
          customer: newActivitiesByProject[project].map(activity => activity.customerName)[0],  // Assuming the first customer's name is what you want
          totalWork: getTotalDurationInMilliseconds(newActivitiesByProject[project].map((activity: ActivityDetails) => activity.workDuration)),

        };
      });
      const newActivitiesByCustomer = lodash.groupBy(activities, (item: ActivityDetails) =>
        item.customerName,
      );
      this.customerOfActivities = Object.keys(newActivitiesByCustomer).length ? Object.keys(newActivitiesByCustomer) : [];
      this.customerOfActivities.forEach(customer => {
        this.activitiesByCustomer[customer] = {
          activities: newActivitiesByCustomer[customer],
          totalWork: getTotalDurationInMilliseconds(newActivitiesByCustomer[customer].map((activity: ActivityDetails) => activity.workDuration)),
        };
      });
      this.chartData = this.projectsOfActivities.map(project => ({
        name: project,
        value: this.activitiesByProject[project].totalWork,
      }));
      this.totalDuration = getDurationFormat(moment.duration(getTotalDurationInMilliseconds(activities.map((activity) => activity.workDuration))));
    }

    this.projectWithMaxTotalWork = this.topProject();
    this.customerWithMaxTotalWork = this.topClient();
  }
  tooltipTextFunction(data): string {
    if (data) {
      const value = moment.utc(data.value).format(TimeFormat.FullTime);

      return `${data.data.name} : ${value} `;
    } else {
      return 'Invalid data';
    }
  }

  displayValue(value: number): string {
    return moment.utc(value).format(TimeFormat.FullTime);
  }

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  yLabelFormatting = (label) => {
    const value = getDurationFormat(moment.duration(this.activitiesByProject[label].totalWork));
    const customer = this.activitiesByProject[label].customer;

    return `${label} - ${customer} : ${value} `;
  }

  percentageValueFormatting = (value) => {
    const totalValue = this.chartData.reduce((acc, item) => acc + item.value, 0);
    const percentage = (value / totalValue) * 100;

    return percentage.toFixed(2) + '%';
  }

  topProject(): string {
    let projectWithMaxTotalWork: string | null = null;
    let maxTotalWork = 0;
    this.projectsOfActivities.map(project => {
      const totalWork = this.activitiesByProject[project].totalWork;
      if (totalWork > maxTotalWork) {
        maxTotalWork = totalWork;
        projectWithMaxTotalWork = project;
      }
    });

    return projectWithMaxTotalWork;
  }

  topClient(): string {
    let customerWithMaxTotalWork: string | null = null;
    let maxTotalWork = 0;
    this.customerOfActivities.map(customer => {
      const totalWork = this.activitiesByCustomer[customer].totalWork;
      if (totalWork > maxTotalWork) {
        maxTotalWork = totalWork;
        customerWithMaxTotalWork = customer;
      }
    });

    return customerWithMaxTotalWork;
  }

}
