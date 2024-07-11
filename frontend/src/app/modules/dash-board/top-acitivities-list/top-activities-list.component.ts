import { Component, Input, OnChanges , OnInit, SimpleChanges } from '@angular/core';
import { ActivityDetails } from '../../../shared/models';
import { select, Store } from '@ngrx/store';
import { getDetailedSelfActivitiesList } from '../../../core/reducers/activity';
import { AppState } from '../../../core/reducers';
import * as moment from 'moment';

@Component({
  selector: 'app-top-activities-list',
  templateUrl: './top-activities-list.component.html',
  styleUrls: ['./top-activities-list.component.scss'],
})
export class TopActivitiesListComponent implements OnInit , OnChanges {
  @Input() selfActivities: ActivityDetails[];

  emptyList = false;
  activitiesList: ActivityDetails[] = [];
  selectedChoice = true;

  constructor(
    private store: Store<AppState>,
  ) {}

  ngOnInit(): void {
    this.fetchActivities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selfActivities && changes.selfActivities.currentValue) {
      this.fetchActivities();
    }}
  onChoiceChange(): void {
    this.fetchActivities();
  }

  fetchActivities(): void {
      if (this.selfActivities) {
        const sortedList = this.selfActivities.sort((a, b) =>
          moment.duration(a.workDuration).asMilliseconds() < moment.duration(b.workDuration).asMilliseconds() ? 1 : -1
        );
        const n = this.selectedChoice ? 10 : sortedList.length;
        this.activitiesList = sortedList.slice(0, n);
      }

  }
}
