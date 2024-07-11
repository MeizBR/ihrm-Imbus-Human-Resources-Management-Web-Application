import { By } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { reducers } from '../../../core/reducers';

import { LeavesListComponent } from './leaves-list.component';
import { LeaveType } from '../../../shared/enum/leave-type.enum';
import { LeaveDetails, LeaveToAdd } from '../../../shared/models';
import { LeaveState } from '../../../shared/enum/leave-state.enum';
import { AddLeaveComponent } from '../components/add-leave/add-leave.component';
import { AngularMaterialModule } from '../../../shared/angular-material/angular-material.module';

describe('LeavesListComponent', () => {
  let component: LeavesListComponent;
  let fixture: ComponentFixture<LeavesListComponent>;
  let matTable: MatTable<LeaveDetails>;
  let matPaginator: MatPaginator;

  const mockDisplayedColumns: string[] = ['userName', 'leaveType', 'start', 'end', 'state', 'state-icon', 'actions'];
  const array: LeaveDetails[] = [
    {
      id: 1,
      start: new Date(2020, 8, 1),
      isHalfDayStart: true,
      end: new Date(2020, 8, 5),
      isHalfDayEnd: true,
      userId: 1,
      isActiveUser: true,
      leaveType: LeaveType.Holiday,
      description: '',
      state: LeaveState.Pending,
      comment: '',
      userName: 'Doe John',
    },
    {
      id: 2,
      start: new Date(2021, 9, 2),
      isHalfDayStart: false,
      end: new Date(2021, 9, 3),
      isHalfDayEnd: true,
      userId: 2,
      isActiveUser: false,
      leaveType: LeaveType.Sick,
      description: '',
      state: LeaveState.InProgress,
      comment: '',
      userName: 'Joe Jackie',
    },
  ];
  const mockList = new MatTableDataSource(array);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LeavesListComponent, AddLeaveComponent],
      imports: [
        AngularMaterialModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        TranslateModule.forRoot(),
        RouterTestingModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeavesListComponent);
    component = fixture.componentInstance;
    component.dataSource = array;
    component.displayedColumns = mockDisplayedColumns;
    component.list = mockList;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the search division correctly', () => {
    const leavesContainer = fixture.debugElement.query(By.css('.leaves-container'));
    expect(leavesContainer).toBeTruthy();
    expect(leavesContainer.nativeElement.childElementCount).toEqual(2);

    const leavesListContainer = fixture.debugElement.query(By.css('.leaves-list-container'));
    expect(leavesListContainer).toBeTruthy();
    expect(leavesListContainer.nativeElement.childElementCount).toEqual(2);

    const searchDiv = fixture.debugElement.query(By.css('.search-div'));
    expect(searchDiv).toBeTruthy();

    const searchFormField = fixture.debugElement.query(By.css('.search-form-field'));
    expect(searchFormField).toBeTruthy();

    const searchInput = fixture.debugElement.query(By.css('.search-form-input'));
    expect(searchInput).toBeTruthy();
    expect(searchInput.properties.placeholder).toEqual('SEARCH');
    expect(searchInput.nativeElement.value).toEqual('');

    let searchButton = fixture.debugElement.query(By.css('.search-form-button'));
    expect(searchButton).toBeFalsy();

    searchInput.nativeElement.value = 'abc';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(searchInput.nativeElement.value).toEqual('abc');
    expect(component.searchKey).toEqual('abc');

    searchButton = fixture.debugElement.query(By.css('.search-form-button'));
    const searchButtonIcon = fixture.debugElement.query(By.css('.search-form-button-icon'));
    expect(searchButton).toBeTruthy();
    expect(searchButtonIcon).toBeTruthy();
    expect(searchButtonIcon.nativeElement.textContent).toEqual('close');
  });

  it('should handle the search actions correctly', () => {
    component.searchKey = 'abc';
    fixture.detectChanges();
    const searchInput = fixture.debugElement.query(By.css('.search-form-input'));
    const searchButton = fixture.debugElement.query(By.css('.search-form-button'));
    const spyOnApplyFilter = spyOn(component, 'applyFilter').and.callThrough();
    const spyOnSearchClear = spyOn(component, 'onSearchClear').and.callThrough();

    expect(searchButton).toBeTruthy();
    searchInput.triggerEventHandler('keyup', null);
    fixture.detectChanges();
    expect(spyOnApplyFilter).toHaveBeenCalled();

    searchButton.nativeElement.click();
    fixture.detectChanges();
    expect(spyOnSearchClear).toHaveBeenCalled();
    expect(spyOnApplyFilter).toHaveBeenCalled();
    expect(component.searchKey).toEqual('');
  });

  it('should display the correct table data', () => {
    matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
    expect(matTable).toBeDefined();
    expect(matTable.dataSource).toBeDefined();
    expect(matTable.dataSource).toEqual(mockList);
  });

  it('should display the correct columns of table list', () => {
    const matTableColumns = fixture.debugElement.nativeElement.querySelectorAll('.mat-header-cell');

    expect(matTableColumns).toBeDefined();
    expect(matTableColumns.length).toBe(7);
    expect(matTableColumns[0].textContent).toBe('LEAVES_VIEW.USER');
    expect(matTableColumns[1].textContent).toBe('LEAVES_VIEW.LEAVE_TYPE.LEAVE_TYPE');
    expect(matTableColumns[2].textContent).toBe('LEAVES_VIEW.START_DATE');
    expect(matTableColumns[3].textContent).toBe('LEAVES_VIEW.END_DATE');
    expect(matTableColumns[4].textContent).toBe('LEAVES_VIEW.STATE.STATE');
    expect(matTableColumns[5].textContent).toBe('');
    expect(matTableColumns[6].textContent).toBe('');
  });

  it('should display the correct rows of table list', () => {
    matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
    const matTableRows = matTable._contentColumnDefs.toArray();

    expect(matTableRows.length).toEqual(8);
    expect(matTableRows[0].name).toBe('userName');
    expect(matTableRows[1].name).toBe('leaveType');
    expect(matTableRows[2].name).toBe('start');
    expect(matTableRows[3].name).toBe('end');
    expect(matTableRows[4].name).toBe('state');
    expect(matTableRows[5].name).toBe('state-icon');
    expect(matTableRows[6].name).toBe('noData');
    expect(matTableRows[7].name).toBe('actions');

    const matTableCell = fixture.debugElement.queryAll(By.css('mat-cell'));

    expect(matTableCell.length).toEqual(14);

    expect(matTableCell[0].children.length).toEqual(1); // FIXME:  check that the component app-item-status exist
    expect(matTableCell[0].children[0].nativeElement.tagName).toEqual('APP-ITEM-STATUS');
    expect(matTableCell[1].nativeElement.textContent).toEqual('LEAVES_VIEW.LEAVE_TYPE.LEAVE_TYPE_ENUM.HOLIDAY');
    expect(matTableCell[2].nativeElement.textContent).toEqual('Sep 1, 2020');
    expect(matTableCell[3].nativeElement.textContent).toEqual('Sep 5, 2020');
    expect(matTableCell[4].nativeElement.textContent).toEqual('LEAVES_VIEW.STATE.PENDING');
    expect(matTableCell[5].nativeElement.textContent).toEqual('hourglass_empty');
    expect(matTableCell[6].nativeElement.textContent).toEqual('description');

    expect(matTableCell[7].children.length).toEqual(1); // FIXME:  check that the component app-item-status exist
    expect(matTableCell[7].children[0].nativeElement.tagName).toEqual('APP-ITEM-STATUS');
    expect(matTableCell[8].nativeElement.textContent).toEqual('LEAVES_VIEW.LEAVE_TYPE.LEAVE_TYPE_ENUM.SICK');
    expect(matTableCell[9].nativeElement.textContent).toEqual('Oct 2, 2021');
    expect(matTableCell[10].nativeElement.textContent).toEqual('Oct 3, 2021');
    expect(matTableCell[11].nativeElement.textContent).toEqual('LEAVES_VIEW.STATE.IN_PROGRESS');
    expect(matTableCell[12].nativeElement.textContent).toEqual('rotate_right');
    expect(matTableCell[13].nativeElement.textContent).toEqual('description');
  });

  it('should display paginator correctly', () => {
    matPaginator = fixture.debugElement.query(By.css('mat-paginator')).componentInstance;

    expect(matPaginator.pageSize).toEqual(5);
    expect(matPaginator.pageSizeOptions.length).toEqual(4);
    expect(matPaginator.pageSizeOptions).toEqual([5, 10, 25, 100]);
  });

  it('should handle form actions correctly', () => {
    const spyOnAddEvent = spyOn(component, 'onAddLeave').and.callThrough();
    const leaveToAdd: LeaveToAdd = {
      start: new Date(2022, 10, 2).toString(),
      isHalfDayStart: false,
      end: new Date(2022, 10, 2).toString(),
      isHalfDayEnd: false,
      leaveType: LeaveType.Sick,
      description: 'Sick Leave',
      state: LeaveState.Pending,
    };

    component.onAddLeave({ leave: leaveToAdd, userId: 3 });
    fixture.detectChanges();
    expect(spyOnAddEvent).toHaveBeenCalledWith({ leave: leaveToAdd, userId: 3 });
  });
});
