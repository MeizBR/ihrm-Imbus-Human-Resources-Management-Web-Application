import { By } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { StoreModule } from '@ngrx/store';
import { reducers } from '../../../core/reducers';

import { EventsListComponent } from './events-list.component';
import { AddEventComponent } from '../components/add-event/add-event.component';

import { EventType } from '../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../shared/enum/repetitive.enum';
import { EventDetails, EventToAdd } from '../../../shared/models/index';
import { AngularMaterialModule } from '../../../shared/angular-material/angular-material.module';

describe('EventsListComponent', () => {
  let component: EventsListComponent;
  let fixture: ComponentFixture<EventsListComponent>;
  let matTable: MatTable<EventDetails>;
  let matPaginator: MatPaginator;

  const mockDisplayedColumns: string[] = ['title', 'calendarName', 'eventType', 'isPrivateCalendar', 'start', 'end', 'actions'];
  const array: EventDetails[] = [
    {
      id: 1,
      calendarId: 1,
      calendarName: 'Calendar N° 1',
      isPrivateCalendar: true,
      start: new Date('2021-01-01T21:00:00.000Z'),
      end: new Date('2021-01-01T21:00:00.000Z'),
      title: 'First Event',
      description: 'Description for First Event',
      repetition: Repetitive.Monthly,
      allDay: true,
      eventType: EventType.Meeting,
    },
    {
      id: 2,
      calendarId: 2,
      calendarName: 'Calendar N° 2',
      isPrivateCalendar: false,
      start: new Date('2021-02-01T22:00:00.000Z'),
      end: new Date('2021-02-01T22:00:00.000Z'),
      title: 'Second Event',
      description: 'Description for Second Event',
      repetition: Repetitive.Yearly,
      allDay: false,
      eventType: EventType.Workshop,
    },
  ];
  const mockList = new MatTableDataSource(array);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventsListComponent, AddEventComponent],
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
    fixture = TestBed.createComponent(EventsListComponent);
    component = fixture.componentInstance;
    component.searchKey = '';
    component.dataSource = array;
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
    expect(matTableColumns[0].textContent).toBe('EVENTS_VIEW.EVENTS_TABLE_HEADER.TITLE');
    expect(matTableColumns[1].textContent).toBe('EVENTS_VIEW.EVENTS_TABLE_HEADER.CALENDAR_NAME');
    expect(matTableColumns[2].textContent).toBe('EVENTS_VIEW.EVENTS_TABLE_HEADER.EVENT_TYPE');
    expect(matTableColumns[3].textContent).toBe('EVENTS_VIEW.EVENTS_TABLE_HEADER.PUBLIC_CALENDAR');
    expect(matTableColumns[4].textContent).toBe('EVENTS_VIEW.EVENTS_TABLE_HEADER.START_DATE');
    expect(matTableColumns[5].textContent).toBe('EVENTS_VIEW.EVENTS_TABLE_HEADER.END_DATE');
    expect(matTableColumns[6].textContent).toBe('');
  });

  it('should display the correct rows of table list', () => {
    matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
    const matTableRows = matTable._contentColumnDefs.toArray();

    expect(matTableRows.length).toEqual(8);
    expect(matTableRows[0].name).toBe('title');
    expect(matTableRows[1].name).toBe('calendarName');
    expect(matTableRows[2].name).toBe('eventType');
    expect(matTableRows[3].name).toBe('isPrivateCalendar');
    expect(matTableRows[4].name).toBe('start');
    expect(matTableRows[5].name).toBe('end');
    expect(matTableRows[6].name).toBe('noData');
    expect(matTableRows[7].name).toBe('actions');

    const matTableCell = fixture.debugElement.queryAll(By.css('mat-cell'));

    expect(matTableCell.length).toEqual(14);

    expect(matTableCell[0].nativeElement.textContent).toEqual('First Event');
    expect(matTableCell[1].nativeElement.textContent).toEqual('Calendar N° 1');
    expect(matTableCell[2].nativeElement.textContent).toEqual('EVENTS_VIEW.EVENT_TYPE_ENUM.MEETING');
    expect(matTableCell[3].nativeElement.textContent).toEqual('clear');
    expect(matTableCell[4].nativeElement.textContent).toEqual('Jan 1, 2021');
    expect(matTableCell[5].nativeElement.textContent).toEqual('Jan 1, 2021');
    expect(matTableCell[7].nativeElement.textContent).toEqual('Second Event');
    expect(matTableCell[8].nativeElement.textContent).toEqual('Calendar N° 2');
    expect(matTableCell[9].nativeElement.textContent).toEqual('EVENTS_VIEW.EVENT_TYPE_ENUM.WORKSHOP');
    expect(matTableCell[10].nativeElement.textContent).toEqual('done');
    // NOTE: to be verified later
    // expect(matTableCell[11].nativeElement.textContent).toEqual('Feb 1, 2021, 23:00');
    // expect(matTableCell[12].nativeElement.textContent).toEqual('Feb 1, 2021, 23:00');
  });

  it('should display paginator correctly', () => {
    matPaginator = fixture.debugElement.query(By.css('mat-paginator')).componentInstance;

    expect(matPaginator.pageSize).toEqual(5);
    expect(matPaginator.pageSizeOptions.length).toEqual(4);
    expect(matPaginator.pageSizeOptions).toEqual([5, 10, 25, 100]);
  });

  it('should handle form actions correctly', () => {
    const spyOnAddEvent = spyOn(component, 'onSubmit').and.callThrough();
    const spyOnDeleteEvent = spyOn(component, 'onDeleteEvent').and.callThrough();
    const eventToAdd: EventToAdd = {
      calendarId: 2,
      start: new Date('2021-02-01'),
      end: new Date('2021-02-01'),
      title: 'Second Event',
      description: 'Description for Second Event',
      allDay: true,
      eventType: EventType.Workshop,
    };

    component.onSubmit(eventToAdd);
    fixture.detectChanges();
    expect(spyOnAddEvent).toHaveBeenCalledWith(eventToAdd);

    component.onDeleteEvent(1);
    component.dialog.closeAll();
    fixture.detectChanges();

    expect(spyOnDeleteEvent).toHaveBeenCalledWith(1);
  });
});
