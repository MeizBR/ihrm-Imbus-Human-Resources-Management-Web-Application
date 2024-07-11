import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../core/reducers';
import * as moment from 'moment';
import * as lodash from 'lodash';
import { ActivityDetails } from '../../../shared/models';
import { getDurationFormat, getTotalDurationInMilliseconds } from '../../activity-management/helpers/activity-.helper';
import { DateFormat, TimeFormat } from '../../../shared/enum/interval.enum';
import { getActivitiesList } from '../../../core/reducers/activity';

@Component({
  selector: 'app-vertical-chart',
  templateUrl: './vertical-chart.component.html',
  styleUrls: ['./vertical-chart.component.scss'],
})
export class VerticalChartComponent implements OnInit, OnChanges {
  @Input() selectedDates: { startDate: string, endDate: string };
  public activitiesByDay: lodash.Dictionary<{ [project: string]: { activities: ActivityDetails[]; totalWork: number } }> = {};
  public daysOfActivities: string[] = [];
  public projectOfActivities: string[] = [];
  public chartData: any[] = [];
  public totalDuration: string;

  constructor(private store: Store<AppState>) {
  }

  ngOnInit(): void {
    this.store.pipe(select(getActivitiesList)).subscribe(activities => {
      if (activities) {
        this.processActivities(activities) ;
      }
       });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedDates && changes.selectedDates.currentValue) {
      this.daysOfActivities = [];
    }
  }
  private processActivities(activities: ActivityDetails[]): void {
    console.log(this.selectedDates);
    const start = moment(this.selectedDates.startDate);
    const end = moment(this.selectedDates.endDate);
    const duration = moment.duration(end.diff(start));
    const daysBetween = duration.asDays();
    const groupByFormat = daysBetween >= 364 ? 'YYYY MMM' : DateFormat.FullDate;
    const unit = groupByFormat === 'YYYY MMM' ? 'month' : 'day';
    for (const m = moment(start); m.diff(end, unit) <= 0; m.add(1, unit)) {
      const formattedDate = m.format(groupByFormat);
      this.daysOfActivities.push(formattedDate);  }
    this.totalDuration = this.calculateTotalDuration(activities);
    const newActivitiesByDay = lodash.groupBy(activities,  activity => moment(activity.start).format(groupByFormat));
    console.log(newActivitiesByDay);
    this.projectOfActivities = [];
    this.activitiesByDay = {};
    this.daysOfActivities.forEach(day => {
      const activitiesGroupedByProject = lodash.groupBy(newActivitiesByDay[day], (item: ActivityDetails) => item.projectName);
      this.updateProjectActivities(day, activitiesGroupedByProject);
    });

    this.prepareChartData();
  }

  private calculateTotalDuration(activities: ActivityDetails[]): string {
    const totalMilliseconds = getTotalDurationInMilliseconds(activities.map(a => a.workDuration));

    return getDurationFormat(moment.duration(totalMilliseconds));
  }

  private updateProjectActivities(day: string, activitiesGroupedByProject: { [project: string]: ActivityDetails[] }): void {
    this.activitiesByDay[day] = {};
    Object.keys(activitiesGroupedByProject).forEach(project => {
      if (!this.projectOfActivities.includes(project)) {
        this.projectOfActivities.push(project);
      }
      const projectActivities = activitiesGroupedByProject[project];
      this.activitiesByDay[day][project] = {
        activities: projectActivities,
        totalWork: getTotalDurationInMilliseconds(projectActivities.map(a => a.workDuration)),
      };
    });
  }

  private prepareChartData(): void {
    this.chartData = this.daysOfActivities.map(day => ({
      name: day,
      series: this.projectOfActivities.map(project => ({
        name: project,
        value: this.activitiesByDay[day]?.[project]?.totalWork || 0,
      })),
    }));
  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.stringify(data));
  }

  yLabelFormatting = (label: number): string => `${Math.floor(moment.duration(label).asHours())}H`;
  displayValue(value: number): string {
    return moment.utc(value).format(TimeFormat.FullTime);
  }

}
