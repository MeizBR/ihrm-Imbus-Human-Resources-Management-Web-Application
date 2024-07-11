import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { Observable, Subscription } from 'rxjs';

import { AppState } from '../../../core/reducers';
import { mappedActiveUsersList } from '../../../core/reducers/user/index';
import { leavesActions } from '../../../core/reducers/leave/leave.actions';
import { isAdminGlobalRole, loggedUserId } from '../../../core/reducers/auth';
import { settingsActions } from '../../../core/reducers/settings/settings.actions';
import { getModulePageSize } from '../../../core/reducers/settings/settings.selectors';
import { IHRMAppModules, ModulesPagesSizes } from '../../../core/reducers/settings/settings.reducer';
import { getLeavesDetailsList, getLeavesError, getLeavesLoading } from '../../../core/reducers/leave';

import { displayedLeaveColumns, filterPredicate } from '../leaves-helpers';

import { ErrorType } from '../../../shared/validators';
import { LeaveType } from '../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../shared/enum/leave-state.enum';
import { sortingDataAccessor } from '../../../shared/helpers/sorting-data.helper';
import { CustomPaginator } from '../../../shared/component/list-items/custom-paginator';
import { LeaveDetails, LeaveToAdd, UserDetails } from '../../../shared/models/index';

@Component({
  selector: 'app-leaves-list',
  templateUrl: './leaves-list.component.html',
  styleUrls: ['./leaves-list.component.scss'],
  providers: [{ provide: MatPaginatorIntl, useFactory: CustomPaginator, deps: [TranslateService] }, DatePipe],
})
export class LeavesListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subscription$: Subscription[] = [];

  public searchKey: string;
  public users: UserDetails[];
  public leaveType = LeaveType;
  public LeaveState = LeaveState;
  public dataSource: LeaveDetails[];
  public currentUser$: Observable<number>;
  public isAdministrator$: Observable<boolean>;
  public usersList$: Observable<UserDetails[]>;
  public displayedColumns = displayedLeaveColumns;
  public error$: Observable<ErrorType | undefined>;
  public leavesPageSize$: Observable<ModulesPagesSizes>;
  public list = new MatTableDataSource<LeaveDetails>([]);
  public isLeaveLoading$: Observable<boolean | undefined>;

  constructor(private store: Store<AppState>, private router: Router, public datePipe: DatePipe) {
    this.error$ = this.store.pipe(select(getLeavesError));
    this.isLeaveLoading$ = this.store.pipe(select(getLeavesLoading));
    this.isAdministrator$ = this.store.pipe(select(isAdminGlobalRole));
    this.currentUser$ = this.store.pipe(select(loggedUserId));
    this.usersList$ = this.store.pipe(select(mappedActiveUsersList));
    this.leavesPageSize$ = this.store.pipe(select(getModulePageSize(IHRMAppModules.Leaves)));
    this.subscription$.push(
      this.store.pipe(select(getLeavesDetailsList)).subscribe(leaves => {
        this.dataSource = leaves;
        this.list = new MatTableDataSource(leaves);
        this.list.sort = this.sort;
        this.list.paginator = this.paginator;
      }),
    );
  }

  ngOnInit(): void {
    this.list.sortingDataAccessor = (data: LeaveDetails, sortHeaderId: string): string => sortingDataAccessor(data, sortHeaderId);
    this.list.filterPredicate = (data: LeaveDetails, filter: string) => filterPredicate(data, filter, this.displayedColumns, this.datePipe);
  }

  ngAfterViewInit(): void {
    this.list = new MatTableDataSource(this.dataSource);
    this.list.paginator = this.paginator;
    this.list.sort = this.sort;
  }

  public onAddLeave(leaveDetails: { leave: LeaveToAdd; userId?: number }): void {
    this.store.dispatch(leavesActions.addLeaveAction({ leave: leaveDetails.leave, userId: leaveDetails.userId }));
  }

  public onSearchClear(): void {
    this.searchKey = '';
    this.applyFilter();
  }

  public applyFilter(): void {
    this.list.filter = this.searchKey?.trim().toLowerCase();
  }

  public navigateToLeaveDetails(id: number): void {
    this.router.navigate(['/home/leaves/leave', id]);
  }

  public updatePagination(event) {
    this.store.dispatch(settingsActions.updateModulePageSizeAction({ pageSize: { module: IHRMAppModules.Leaves, size: event.pageSize } }));
  }
}
