import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatCheckbox } from '@angular/material/checkbox';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { reducers } from '../../../../core/reducers';

import { FilterCalendarsComponent } from './filter-calendars.component';

import { CalendarsListFilter, UsersLeavesFilter } from '../../../../shared/models/index';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('FilterCalendarsComponent', () => {
  let component: FilterCalendarsComponent;
  let fixture: ComponentFixture<FilterCalendarsComponent>;
  let checkBox: MatCheckbox;
  let calendarEventsList: CalendarsListFilter[] = [
    {
      calendarId: 1,
      calendarName: 'Calendar N°1',
      isChecked: true,
    },
    {
      calendarId: 2,
      calendarName: 'Calendar N°2',
      isChecked: false,
    },
  ];
  let usersLeavesList: UsersLeavesFilter[] = [
    {
      userId: 1,
      userName: 'Doe John',
      isChecked: true,
    },
    {
      userId: 2,
      userName: 'Joe Jackie',
      isChecked: false,
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilterCalendarsComponent],
      imports: [TranslateModule.forRoot(), AngularMaterialModule, StoreModule.forRoot(reducers)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterCalendarsComponent);
    component = fixture.componentInstance;
    component.eventsFilterList = calendarEventsList;
    component.allCalendarsSelected = false;
    component.leavesFilterList = usersLeavesList;
    component.allLeavesSelected = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the calendars correctly', () => {
    component.eventsFilterList = undefined;
    component.ngOnChanges({ calendarsEventsFilterList: new SimpleChange(calendarEventsList, undefined, true) });
    fixture.detectChanges();

    let calendarsSection = fixture.debugElement.query(By.css('.calendars-section'));
    expect(calendarsSection).toBeFalsy();

    component.eventsFilterList = calendarEventsList;
    component.ngOnChanges({ calendarsFiltersList: new SimpleChange(calendarEventsList, undefined, true) });
    fixture.detectChanges();

    calendarsSection = fixture.debugElement.query(By.css('.calendars-section'));
    expect(calendarsSection).toBeTruthy();

    const title = fixture.debugElement.query(By.css('.calendars-section .right-bar-title'));
    expect(title).toBeTruthy();
    expect(title.nativeElement.textContent).toEqual('CALENDAR_VIEW.RIGHT_BAR.EVENTS_LIST :');

    const filterTitle = fixture.debugElement.query(By.css('.calendars-section .filter-title'));
    expect(filterTitle).toBeTruthy();
    expect(filterTitle.nativeElement.textContent).toEqual('CALENDAR_VIEW.RIGHT_BAR.FILTER_BY_CALENDAR :');

    const allCalendarsSection = fixture.debugElement.query(By.css('.all-calendars-section'));
    expect(allCalendarsSection).toBeTruthy();

    let allCalendarsCheckbox = fixture.debugElement.query(By.css('.all-calendars-checkbox')).componentInstance;
    expect(allCalendarsCheckbox).toBeTruthy();
    expect(allCalendarsCheckbox.checked).toEqual(false);

    const allCalendarsCheckboxSpan = fixture.debugElement.query(By.css('.all-calendars-checkbox span'));
    expect(allCalendarsCheckboxSpan).toBeTruthy();
    expect(allCalendarsCheckboxSpan.nativeElement.innerText).toEqual('CALENDAR_VIEW.RIGHT_BAR.CHECK_UNCHECK_ALL');

    const calendarsListSection = fixture.debugElement.queryAll(By.css('.calendars-list-section'));
    expect(calendarsListSection).toBeTruthy();
    expect(calendarsListSection.length).toEqual(2);

    const calendarCheckboxes = fixture.debugElement.queryAll(By.css('.calendar-checkbox'));
    expect(calendarCheckboxes).toBeTruthy();
    expect(calendarCheckboxes.length).toEqual(2);

    checkBox = calendarCheckboxes[0].componentInstance;
    expect(checkBox.checked).toEqual(true);

    checkBox = calendarCheckboxes[1].componentInstance;
    expect(checkBox.checked).toEqual(false);

    const filterDetails = fixture.debugElement.query(By.css('.filter-details'));
    expect(filterDetails).toBeTruthy();

    const eventIcon = fixture.debugElement.query(By.css('.event-icon'));
    expect(eventIcon).toBeTruthy();
    expect(eventIcon.nativeElement.textContent).toEqual('today');

    const calendarNames = fixture.debugElement.queryAll(By.css('.calendar-name'));
    expect(calendarNames).toBeTruthy();
    expect(calendarNames.length).toEqual(2);
    expect(calendarNames[0].nativeElement.textContent).toEqual('Calendar N°1');
    expect(calendarNames[1].nativeElement.textContent).toEqual('Calendar N°2');

    calendarEventsList = [
      {
        calendarId: 1,
        calendarName: 'Calendar N°1',
        isChecked: true,
      },
      {
        calendarId: 2,
        calendarName: 'Calendar N°2',
        isChecked: true,
      },
    ];
    component.eventsFilterList = calendarEventsList;
    component.allCalendarsSelected = true;
    component.ngOnChanges({ calendarsFiltersList: new SimpleChange(calendarEventsList, undefined, true) });
    fixture.detectChanges();

    allCalendarsCheckbox = fixture.debugElement.query(By.css('.all-calendars-checkbox')).componentInstance;
    expect(allCalendarsCheckbox).toBeTruthy();
    expect(allCalendarsCheckbox.checked).toEqual(true);
  });

  it('should display the users leaves correctly', () => {
    component.leavesFilterList = undefined;
    component.ngOnChanges({ usersLeavesFilterList: new SimpleChange(usersLeavesList, undefined, true) });
    fixture.detectChanges();

    let usersleavesSection = fixture.debugElement.query(By.css('.users-leaves-section'));
    expect(usersleavesSection).toBeFalsy();

    component.leavesFilterList = usersLeavesList;
    component.ngOnChanges({ usersLeavesFilterList: new SimpleChange(usersLeavesList, undefined, true) });
    fixture.detectChanges();

    usersleavesSection = fixture.debugElement.query(By.css('.users-leaves-section'));
    expect(usersleavesSection).toBeTruthy();

    const title = fixture.debugElement.query(By.css('.users-leaves-section .right-bar-title'));
    expect(title).toBeTruthy();
    expect(title.nativeElement.textContent).toEqual('CALENDAR_VIEW.RIGHT_BAR.LEAVES_LIST :');

    const filterTitle = fixture.debugElement.query(By.css('.users-leaves-section .filter-title'));
    expect(filterTitle).toBeTruthy();
    expect(filterTitle.nativeElement.textContent).toEqual('CALENDAR_VIEW.RIGHT_BAR.FILTER_BY_USER :');

    const allLeavesSection = fixture.debugElement.query(By.css('.all-leaves-section'));
    expect(allLeavesSection).toBeTruthy();

    let allLeavesCheckbox = fixture.debugElement.query(By.css('.all-leaves-checkbox')).componentInstance;
    expect(allLeavesCheckbox).toBeTruthy();
    expect(allLeavesCheckbox.checked).toEqual(false);

    const allLeavesCheckboxSpan = fixture.debugElement.query(By.css('.all-leaves-checkbox span'));
    expect(allLeavesCheckboxSpan).toBeTruthy();
    expect(allLeavesCheckboxSpan.nativeElement.innerText).toEqual('CALENDAR_VIEW.RIGHT_BAR.CHECK_UNCHECK_ALL');

    const leavesListSection = fixture.debugElement.queryAll(By.css('.leaves-list-section'));
    expect(leavesListSection).toBeTruthy();
    expect(leavesListSection.length).toEqual(2);

    const userCheckboxes = fixture.debugElement.queryAll(By.css('.user-checkbox'));
    expect(userCheckboxes).toBeTruthy();
    expect(userCheckboxes.length).toEqual(2);

    checkBox = userCheckboxes[0].componentInstance;
    expect(checkBox.checked).toEqual(true);

    checkBox = userCheckboxes[1].componentInstance;
    expect(checkBox.checked).toEqual(false);

    const filterDetails = fixture.debugElement.query(By.css('.filter-details'));
    expect(filterDetails).toBeTruthy();

    const userIcon = fixture.debugElement.query(By.css('.user-icon'));
    expect(userIcon).toBeTruthy();
    expect(userIcon.nativeElement.textContent).toEqual('person');

    const usersName = fixture.debugElement.queryAll(By.css('.user-name'));
    expect(usersName).toBeTruthy();
    expect(usersName.length).toEqual(2);
    expect(usersName[0].nativeElement.textContent).toEqual('Doe John');
    expect(usersName[1].nativeElement.textContent).toEqual('Joe Jackie');

    usersLeavesList = [
      {
        userId: 1,
        userName: 'Doe John',
        isChecked: true,
      },
      {
        userId: 2,
        userName: 'Joe Jackie',
        isChecked: true,
      },
    ];
    component.leavesFilterList = usersLeavesList;
    component.allLeavesSelected = true;
    component.ngOnChanges({ usersLeavesFilterList: new SimpleChange(usersLeavesList, undefined, true) });
    fixture.detectChanges();

    allLeavesCheckbox = fixture.debugElement.query(By.css('.all-leaves-checkbox')).componentInstance;
    expect(allLeavesCheckbox).toBeTruthy();
    expect(allLeavesCheckbox.checked).toEqual(true);
  });

  it('should display the no items message correctly', () => {
    component.noItemMsg = '';
    fixture.detectChanges();
    let noItemsSection = fixture.debugElement.query(By.css('.no-items-section'));
    expect(noItemsSection).toBeFalsy();

    component.noItemMsg = 'no items';
    fixture.detectChanges();
    noItemsSection = fixture.debugElement.query(By.css('.no-items-section'));
    expect(noItemsSection).toBeTruthy();
  });

  it('should handle calendars actions correctly', () => {
    component.allCalendarsSelected = false;
    component.ngOnChanges({ calendarsFiltersList: new SimpleChange(calendarEventsList, undefined, true) });
    fixture.detectChanges();

    const spyOntoggleAllCalendar = spyOn(component, 'toggleAllCalendar').and.callThrough();
    const spyOnToggleCalendarsFilter = spyOn(component, 'checkedCalendarChanged').and.callThrough();
    const calendarCheckboxes = fixture.debugElement.queryAll(By.css('.calendar-checkbox label'));
    const allCalendarCheckbox = fixture.debugElement.query(By.css('.all-calendars-checkbox label'));

    calendarCheckboxes[0].nativeElement.click();
    fixture.detectChanges();
    expect(spyOnToggleCalendarsFilter).toHaveBeenCalledWith(1, false);

    allCalendarCheckbox.nativeElement.click();
    fixture.detectChanges();
    expect(spyOntoggleAllCalendar).toHaveBeenCalledWith();
  });

  it('should handle leaves actions correctly', () => {
    component.allLeavesSelected = false;
    component.ngOnChanges({ usersLeavesFilterList: new SimpleChange(usersLeavesList, undefined, true) });
    fixture.detectChanges();

    const spyOntoggleAllLeaves = spyOn(component, 'toggleAllLeaves').and.callThrough();
    const spyOnToggleLeavesFilter = spyOn(component, 'checkedUserLeavesChanged').and.callThrough();
    const usersCheckboxes = fixture.debugElement.queryAll(By.css('.user-checkbox label'));
    const allLeavesCheckbox = fixture.debugElement.query(By.css('.all-leaves-checkbox label'));

    usersCheckboxes[0].nativeElement.click();
    fixture.detectChanges();
    expect(spyOnToggleLeavesFilter).toHaveBeenCalledWith(1, false);

    allLeavesCheckbox.nativeElement.click();
    fixture.detectChanges();
    expect(spyOntoggleAllLeaves).toHaveBeenCalledWith();
  });
});
