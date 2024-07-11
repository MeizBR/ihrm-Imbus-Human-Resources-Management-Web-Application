import { Component, Input, OnChanges , OnInit, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import * as lodash from 'lodash';
import { getDurationFormat, getTotalDuration, getTotalDurationInMilliseconds } from '../../activity-management/helpers/activity-.helper';
import { ActivityDetails } from '../../../shared/models';
import { getActivitiesList } from '../../../core/reducers/activity';
import { AppState } from '../../../core/reducers';

@Component({
  selector: 'app-team-activities-list',
  templateUrl: './team-activities-list.component.html',
  styleUrls: ['./team-activities-list.component.scss'],
})
export class TeamActivitiesListComponent implements OnInit , OnChanges {
  @Input() activities: ActivityDetails[];

  displayedColumns: string[] = ['teamMember', 'latestActivity', 'totalTracked'];
  public usersOfActivities: string[] = [];
  public projectofActivities: string[] = [];
  public chartData: { [key: string]: any } = {};
  public activitiesByUser: lodash.Dictionary< { activities: ActivityDetails[]; totalWork: string }> = {};
  public activitiesByProject: lodash.Dictionary<{
    [project: string]: { activities: ActivityDetails[]; totalWork: number }
  }> = {};
  public totalDuration: string;

  constructor(private store: Store<AppState>) {
  }

  ngOnInit(): void {
  this.getActivities();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activities && changes.activities.currentValue) {
      this.getActivities();
    }
  }
 getActivities() {
   if (!this.activities) { return; }
   this.totalDuration = getDurationFormat(moment.duration(getTotalDurationInMilliseconds(this.activities.map(activity => activity.workDuration))));
   const newActivitiesByUser = lodash.groupBy(this.activities, (item: ActivityDetails) => item.userName);
   this.usersOfActivities = Object.keys(newActivitiesByUser);
   if (!this.usersOfActivities) { return; }
   this.usersOfActivities.forEach(user => {
     this.activitiesByUser[user] = {
       activities: newActivitiesByUser[user],
       totalWork: getTotalDuration(newActivitiesByUser[user].map((activity: ActivityDetails) => activity.workDuration)),
     };
     const activitiesGroupedByProject = lodash.groupBy(newActivitiesByUser[user], (item: ActivityDetails) => item.projectName);
     const projects = Object.keys(activitiesGroupedByProject);

     if (!projects) {
       return;
     }

     projects.forEach(project => {
       if (!this.projectofActivities.includes(project)) {
         this.projectofActivities.push(project);
       }
     });
     this.activitiesByProject[user] = {};
     projects.forEach(project => {
       this.activitiesByProject[user][project] = {
         activities: activitiesGroupedByProject[project],
         totalWork: getTotalDurationInMilliseconds(activitiesGroupedByProject[project].map((activity: ActivityDetails) => activity.workDuration)),
       };
     });

   });

   this.usersOfActivities.forEach(user => {
     this.chartData[user] = [{
       name: user,
       series: this.projectofActivities.map(project => ({
         name: project,
         value: this.activitiesByProject[user]?.[project]?.totalWork || 0,
       })),
     }];
   });

 }

}
