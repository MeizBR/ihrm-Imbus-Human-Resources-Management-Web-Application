import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { DateFormat } from '../../../shared/enum/interval.enum';
import { activityActions } from '../../../core/reducers/activity/activity.actions';
import { AppState } from '../../../core/reducers';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'app-dash-board-header',
  templateUrl: './dash-board-header.component.html',
  styleUrls: ['./dash-board-header.component.scss']
})
export class DashBoardHeaderComponent implements OnInit {
  @Output() choiceChange = new EventEmitter<boolean>();
  @Output() dateRangeChange = new EventEmitter<{ startDate: string, endDate: string }>();
  selectedChoice = true;
  unit: moment.unitOfTime.DurationConstructor = 'day';
  selectedDates: { startDate: moment.Moment, endDate: moment.Moment } =
    { startDate: moment().subtract(1, 'month').startOf('month'), endDate: moment().subtract(1, 'month').endOf('month')};
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'This Year': [moment().startOf('year'), moment().endOf('year')],
    'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
  };

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  onDatesUpdated(event): void {
    this.unit = 'day';
    if (event.startDate && event.endDate) {
      this.selectedDates = { startDate: moment(event.startDate), endDate: moment(event.endDate) };
      this.loadActivities();
    } else {
      console.error('Date range object is missing expected properties');
    }
  }

  emitDateRange(): void {
    const formattedStartDate = this.selectedDates.startDate.format('YYYY-MM-DD');
    const formattedEndDate = this.selectedDates.endDate.format('YYYY-MM-DD');
    this.dateRangeChange.emit({ startDate: formattedStartDate, endDate: formattedEndDate });
  }

  changeChoice(choice: boolean): void {
    this.selectedChoice = choice;
    this.loadActivities();
    this.choiceChange.emit(this.selectedChoice);
  }

  navigateDate(direction: number): void {
    const rangeKeys = Object.keys(this.ranges);
    const currentRange = rangeKeys.find(key => {
      const [start, end] = this.ranges[key];

      return start.isSame(this.selectedDates.startDate, 'day') && end.isSame(this.selectedDates.endDate, 'day');
    });
    if (currentRange?.includes('Month')) {
      this.unit = 'month';
    } else if (currentRange?.includes('Year')) {
      this.unit = 'year';
    } else if (currentRange?.includes('day')) {
      this.unit = 'day';
    }
    const newStartDate = this.selectedDates.startDate.add(direction, this.unit);
    const newEndDate = this.selectedDates.endDate.add(direction, this.unit);

    this.selectedDates = {
      startDate: newStartDate,
      endDate: newEndDate
    };
    this.loadActivities();
  }
  private loadActivities() {
    const formattedStartDate = this.selectedDates.startDate.format('YYYY-MM-DD');
    const formattedEndDate = this.selectedDates.endDate.format('YYYY-MM-DD');
    this.store.dispatch(activityActions.loadActivityAction({
      from: formattedStartDate,
      to: formattedEndDate
    }));
    this.store.dispatch(activityActions.loadSelfActivityAction({
      from: formattedStartDate,
      to: formattedEndDate
    }));

    this.emitDateRange();
  }
}
