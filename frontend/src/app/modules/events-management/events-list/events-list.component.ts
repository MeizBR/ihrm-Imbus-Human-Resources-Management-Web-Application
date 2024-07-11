import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppState } from '../../../core/reducers';
import { getCalendarsDetailsList } from '../../../core/reducers/calendar';
import { eventsActions } from '../../../core/reducers/event/event.actions';
import { settingsActions } from '../../../core/reducers/settings/settings.actions';
import { getModulePageSize } from '../../../core/reducers/settings/settings.selectors';
import { IHRMAppModules, ModulesPagesSizes } from '../../../core/reducers/settings/settings.reducer';
import { getEventsDetailedList, getEventsError, getEventsLoading } from '../../../core/reducers/event';

import { CustomPaginator } from '../../../shared/component/list-items/custom-paginator';
import { displayedEventsColumns, filterPredicate, sortingDataAccessor } from '../event-helpers';

import { EventType } from '../../../shared/enum/event-type.enum';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { CalendarDetails, ConfirmDialogModel, EventDetails, EventToAdd } from '../../../shared/models/index';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss'],
  providers: [DatePipe, { provide: MatPaginatorIntl, useFactory: CustomPaginator, deps: [TranslateService] }],
})
export class EventsListComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subscription$: Subscription[] = [];

  public error$: Observable<ErrorType | undefined>;
  public calendarsList$: Observable<CalendarDetails[]>;
  public isEventsLoading$: Observable<boolean | undefined>;

  public searchKey: string;

  public displayedColumns = displayedEventsColumns;
  public list = new MatTableDataSource<EventDetails>([]);
  public eventsPageSize$: Observable<ModulesPagesSizes>;
  public dataSource: EventDetails[];

  public eventType = EventType;

  constructor(public dialog: MatDialog, private router: Router, private store: Store<AppState>) {
    this.error$ = this.store.pipe(select(getEventsError));
    this.calendarsList$ = this.store.pipe(select(getCalendarsDetailsList));
    this.isEventsLoading$ = this.store.pipe(select(getEventsLoading));
    this.eventsPageSize$ = this.store.pipe(select(getModulePageSize(IHRMAppModules.Events)));
    this.subscription$.push(
      this.store.pipe(select(getEventsDetailedList)).subscribe(detailedEvents => {
        this.dataSource = detailedEvents;
        this.list = new MatTableDataSource(detailedEvents);
        this.list.paginator = this.paginator;
        this.list.sortingDataAccessor = (data: EventDetails, sortHeaderId: string): string => sortingDataAccessor(data, sortHeaderId);
        this.list.sort = this.sort;
        this.list.filterPredicate = (data, filter) => filterPredicate(data, filter, this.displayedColumns);
      }),
    );
  }

  ngAfterViewInit(): void {
    this.list = new MatTableDataSource(this.dataSource);
    this.list.paginator = this.paginator;
    this.list.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscription$.forEach(s => s.unsubscribe());
  }

  public onSubmit(eventToAdd: EventToAdd): void {
    this.store.dispatch(eventsActions.addEventAction({ eventToAdd }));
  }

  public onDeleteEvent(id: number): void {
    const data: ConfirmDialogModel = { title: 'DELETE_TITLE', message: 'DELETE_MESSAGE' };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });
    this.subscription$.push(
      dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
        if (dialogResult) {
          this.store.dispatch(eventsActions.deleteEventAction({ id: id }));
        }
      }),
    );
  }

  public onSearchClear(): void {
    this.searchKey = '';
    this.applyFilter();
  }

  public applyFilter(): void {
    this.list.filter = this.searchKey?.trim().toLowerCase();
  }

  public navigateToEventDetails(id: number): void {
    this.router.navigate(['/home/events/event', id]);
  }

  public updatePagination(event) {
    this.store.dispatch(settingsActions.updateModulePageSizeAction({ pageSize: { module: IHRMAppModules.Events, size: event.pageSize } }));
  }
}
