import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppState } from '../../../core/reducers';
import { getActiveProjectsOfConnectedUser } from '../../../core/reducers/project';
import { settingsActions } from '../../../core/reducers/settings/settings.actions';
import { calendarsActions } from '../../../core/reducers/calendar/calendar.actions';
import { getModulePageSize } from '../../../core/reducers/settings/settings.selectors';
import { IHRMAppModules, ModulesPagesSizes } from '../../../core/reducers/settings/settings.reducer';
import { getCalendarsDetailsList, getCalendarsError, getCalendarsLoading } from '../../../core/reducers/calendar';

import { displayedCalendarsColumns, filterPredicate } from '../calendar-helpers';

import { ErrorType } from '../../../shared/validators/validation-error-type';
import { sortingDataAccessor } from '../../../shared/helpers/sorting-data.helper';
import { CustomPaginator } from '../../../shared/component/list-items/custom-paginator';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { CalendarDetails, CalendarToAdd, ConfirmDialogModel, ProjectDetails } from '../../../shared/models/index';

@Component({
  selector: 'app-calendars-list',
  templateUrl: './calendars-list.component.html',
  styleUrls: ['./calendars-list.component.scss'],
  providers: [{ provide: MatPaginatorIntl, useFactory: CustomPaginator, deps: [TranslateService] }],
})
export class CalendarsListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort, { static: false }) set sort(value: MatSort) {
    this.list.sort = value;
  }
  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    this.list.paginator = value;
  }

  private dataSource: CalendarDetails[];
  private subscription$: Subscription[] = [];

  public searchKey: string;
  public pageSize$: Observable<ModulesPagesSizes>;
  public error$: Observable<ErrorType | undefined>;
  public displayedColumns = displayedCalendarsColumns;
  public calendarsPageSize$: Observable<ModulesPagesSizes>;
  public isCalendarsLoading$: Observable<boolean | undefined>;
  public projectsList$: Observable<ProjectDetails[] | undefined>;
  public list: MatTableDataSource<CalendarDetails> = new MatTableDataSource([]);

  // NOTE: dialog is public to be accessible from spec to close the dialog after the spyOn delete calendar
  constructor(private store: Store<AppState>, private router: Router, public dialog: MatDialog) {
    this.list = new MatTableDataSource([]);
    this.subscription$.push(
      this.store.pipe(select(getCalendarsDetailsList)).subscribe(detailedCalendars => {
        this.dataSource = detailedCalendars;
        this.list = new MatTableDataSource(detailedCalendars);
        this.list.paginator = this.paginator;
        this.list.sortingDataAccessor = (data: CalendarDetails, sortHeaderId: string): string => sortingDataAccessor(data, sortHeaderId);
        this.list.sort = this.sort;
        this.list.filter = this.searchKey?.trim().toLowerCase();
        this.list.filterPredicate = (data, filter) => filterPredicate(data, filter, this.displayedColumns);
      }),
    );

    this.error$ = this.store.pipe(select(getCalendarsError));
    this.projectsList$ = this.store.pipe(select(getActiveProjectsOfConnectedUser));
    this.isCalendarsLoading$ = this.store.pipe(select(getCalendarsLoading));
    this.calendarsPageSize$ = this.store.pipe(select(getModulePageSize(IHRMAppModules.Calendars)));
  }

  ngOnInit(): void {
    this.list = new MatTableDataSource(this.dataSource);
    this.list.paginator = this.paginator;
    this.list.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscription$.forEach(sub => sub.unsubscribe());
  }

  public onAddCalendar(calendarToAdd: CalendarToAdd): void {
    this.store.dispatch(calendarsActions.addCalendarAction({ calendarToAdd }));
  }

  public onDeleteCalendar(id: number): void {
    let dialogRef: MatDialogRef<ConfirmDialogComponent>;
    const data: ConfirmDialogModel = {
      title: 'DELETE_TITLE',
      message: 'DELETE_CALENDAR_MESSAGE',
    };

    dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });

    dialogRef?.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.store.dispatch(calendarsActions.deleteCalendarAction({ id: id }));
      }
    });
  }

  public onSearchClear(): void {
    this.searchKey = '';
    this.applyFilter();
  }

  public applyFilter(): void {
    this.list.filter = this.searchKey?.trim().toLowerCase();
  }

  public navigateToCalendarDetails(id: number): void {
    this.router.navigate(['/home/calendars/calendar', id]);
  }

  public updatePagination(event) {
    this.store.dispatch(settingsActions.updateModulePageSizeAction({ pageSize: { module: IHRMAppModules.Calendars, size: event.pageSize } }));
  }
}
