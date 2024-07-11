import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { reducers } from '../../../core/reducers';

import { CalendarsListComponent } from './calendars-list.component';

import { AngularMaterialModule } from '../../../shared/angular-material/angular-material.module';
import { CalendarDetails, CalendarToAdd } from '../../../shared/models/calendar-models/calendar-models-index';

describe('CalendarsListComponent', () => {
  let component: CalendarsListComponent;
  let fixture: ComponentFixture<CalendarsListComponent>;
  let matTable: MatTable<CalendarDetails>;
  let matPaginator: MatPaginator;

  const mockDisplayedColumns: string[] = ['name', 'project', 'timeZone', 'isPublic', 'actions'];
  const array: CalendarDetails[] = [
    {
      id: 1,
      project: 1,
      projectName: 'Projet A1',
      name: 'Calendar N° 1',
      description: 'Description',
      isPrivate: true,
      userId: 1,
      timeZone: 'Africa/Tunis',
      userPermission: { canDelete: true },
    },
    {
      id: 2,
      name: 'Calendar N° 2',
      description: 'Description',
      isPrivate: false,
      userId: 2,
      timeZone: 'Africa/Tunis',
      userPermission: { canDelete: false },
    },
  ];
  const mockList = new MatTableDataSource(array);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
      declarations: [CalendarsListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarsListComponent);
    component = fixture.componentInstance;
    component.searchKey = '';
    component.displayedColumns = mockDisplayedColumns;
    component.list = mockList;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the search division correctly', () => {
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

  xit('should display the correct table data', () => {
    matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
    expect(matTable).toBeDefined();
    expect(matTable.dataSource).toBeDefined();
    expect(matTable.dataSource).toEqual(mockList);
  });

  it('should display the correct columns of table list', () => {
    component.list = mockList;
    fixture.detectChanges();
    const matTableColumns = fixture.debugElement.nativeElement.querySelectorAll('.mat-header-cell');

    expect(matTableColumns).toBeDefined();
    expect(matTableColumns.length).toBe(5);
    expect(matTableColumns[0].textContent).toBe('CALENDAR_VIEW.CALENDAR_TABLE_HEADER.CALENDAR_NAME');
    expect(matTableColumns[1].textContent).toBe('CALENDAR_VIEW.CALENDAR_TABLE_HEADER.PROJECT');
    expect(matTableColumns[2].textContent).toBe('CALENDAR_VIEW.CALENDAR_TABLE_HEADER.TIMEZONE');
    expect(matTableColumns[3].textContent).toBe('CALENDAR_VIEW.CALENDAR_TABLE_HEADER.PUBLIC');
    expect(matTableColumns[4].textContent).toBe('');
  });

  it('should display the correct rows of table list', () => {
    component.list = mockList;
    fixture.detectChanges();
    matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
    const matTableRows = matTable._contentColumnDefs.toArray();

    expect(matTableRows.length).toEqual(6);
    expect(matTableRows[0].name).toBe('name');
    expect(matTableRows[1].name).toBe('project');
    expect(matTableRows[2].name).toBe('timeZone');
    expect(matTableRows[3].name).toBe('isPublic');
    expect(matTableRows[4].name).toBe('noData');
    expect(matTableRows[5].name).toBe('actions');

    const matTableCell = fixture.debugElement.queryAll(By.css('mat-cell'));

    expect(matTableCell.length).toEqual(10);
    expect(matTableCell[0].nativeElement.textContent).toEqual('Calendar N° 1');
    expect(matTableCell[2].nativeElement.textContent).toEqual('Africa/Tunis');
    expect(matTableCell[3].nativeElement.textContent).toEqual('clear');
    expect(matTableCell[5].nativeElement.textContent).toEqual('Calendar N° 2');
    expect(matTableCell[6].nativeElement.textContent).toEqual('-- -- --');
    expect(matTableCell[7].nativeElement.textContent).toEqual('Africa/Tunis');
    expect(matTableCell[8].nativeElement.textContent).toEqual('done');
  });

  it('should mat paginator correctly', () => {
    matPaginator = fixture.debugElement.query(By.css('mat-paginator')).componentInstance;

    expect(matPaginator.pageSize).toEqual(5);
    expect(matPaginator.pageSizeOptions.length).toEqual(4);
    expect(matPaginator.pageSizeOptions).toEqual([5, 10, 25, 100]);
  });

  it('should handle form actions correctly', () => {
    const spyOnAddCalendar = spyOn(component, 'onAddCalendar').and.callThrough();
    const spyOnDeleteCalendar = spyOn(component, 'onDeleteCalendar').and.callThrough();
    const calendarToAdd: CalendarToAdd = {
      project: 2,
      name: 'Calendar N°3',
      description: 'New Description of Calendar N°3',
      isPrivate: false,
      timeZone: 'Africa/Tunis',
    };

    component.onAddCalendar(calendarToAdd);
    fixture.detectChanges();
    expect(spyOnAddCalendar).toHaveBeenCalledWith(calendarToAdd);

    component.onDeleteCalendar(1);
    component.dialog.closeAll();
    fixture.detectChanges();

    expect(spyOnDeleteCalendar).toHaveBeenCalledWith(1);
  });
});
