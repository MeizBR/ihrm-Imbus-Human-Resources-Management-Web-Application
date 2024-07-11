import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { AppState } from '../../core/reducers';
import { getActivitiesList, getDetailedSelfActivitiesList } from '../../core/reducers/activity';
import { ActivityDetails } from '../../shared/models';

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.scss'],
})
export class DashBoardComponent implements OnInit {
  selectedChoice = true;
  selectedDatesSource = new BehaviorSubject<{ startDate: string, endDate: string }>({ startDate: '', endDate: '' });
  selectedDates$ = this.selectedDatesSource.asObservable();
  actualSelectedDates: { startDate: string, endDate: string };
  activities: ActivityDetails[] = [];
  selfActivities: ActivityDetails[] = [];

  constructor(private store: Store<AppState>) {
  }

  ngOnInit(): void {
    combineLatest([
      this.store.pipe(select(getActivitiesList)),
      this.store.pipe(select(getDetailedSelfActivitiesList)),
      this.selectedDates$,
    ]).pipe(
      map(([activities, selfActivities, selectedDates]) => {
        return { activities, selfActivities , selectedDates};
      }),
    ).subscribe(({ activities, selfActivities, selectedDates }) => {
      this.activities = activities;
      this.selfActivities = selfActivities;
      this.actualSelectedDates = selectedDates;

    });
  }
  onChoiceChange(choice: boolean) {
    this.selectedChoice = choice;
  }

  ondateRangeChange(dates: { startDate: string, endDate: string }) {
    this.selectedDatesSource.next(dates);
  }
}
