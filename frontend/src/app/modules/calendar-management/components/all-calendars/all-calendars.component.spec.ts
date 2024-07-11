import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { AllCalendarsComponent } from './all-calendars.component';

import { CalendarDetails } from '../../../../shared/models';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AllCalendarsComponent', () => {
  let component: AllCalendarsComponent;
  let fixture: ComponentFixture<AllCalendarsComponent>;
  const calendarsList: CalendarDetails[] = [
    {
      id: 1,
      project: 1,
      projectName: 'Project A1',
      name: 'Calendar N°1',
      description: 'Description',
      isPrivate: false,
      userId: 1,
      timeZone: 'Africa/Tunis',
    },
    {
      id: 2,
      project: 2,
      projectName: 'Project B1',
      name: 'Calendar N°2',
      description: 'Description',
      isPrivate: true,
      userId: 2,
      timeZone: 'Africa/Tunis',
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, BrowserAnimationsModule, TranslateModule.forRoot(), RouterTestingModule],
      declarations: [AllCalendarsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllCalendarsComponent);
    component = fixture.componentInstance;
    component.calendarsList = calendarsList;
    component.selectedCalendarId = 1;
    component.pageSize = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the initial static component DOM, header and content details correctly', () => {
    component.ngOnChanges({ calendarsList: new SimpleChange(calendarsList, undefined, true) });
    fixture.detectChanges();

    const allCalendarsCard = fixture.debugElement.query(By.css('.all-calendars-card'));
    expect(allCalendarsCard).toBeTruthy();
    expect(allCalendarsCard.nativeElement.childElementCount).toEqual(2);

    const allCalendarsCardHeaderText = fixture.debugElement.query(By.css('.all-calendars-card-header-text'));
    expect(allCalendarsCardHeaderText).toBeTruthy();
    expect(allCalendarsCardHeaderText.nativeElement.childElementCount).toEqual(1);

    const allCalendarsCardTitle = fixture.debugElement.query(By.css('.all-calendars-card-title'));
    expect(allCalendarsCardTitle).toBeTruthy();
    expect(allCalendarsCardTitle.nativeElement.textContent).toEqual('CALENDAR_VIEW.EDIT_CALENDAR.ALL_CALENDARS');

    const calendarsCardContent = fixture.debugElement.query(By.css('.all-calendars-card-content'));
    expect(calendarsCardContent).toBeTruthy();

    const calendarDetailsContent = fixture.debugElement.query(By.css('.calendar-details-content'));
    expect(calendarDetailsContent).toBeTruthy();
    expect(calendarDetailsContent.nativeElement.childElementCount).toEqual(1);

    const calendarDetailsColumn = fixture.debugElement.query(By.css('.calendar-details'));
    expect(calendarDetailsColumn).toBeTruthy();
    expect(calendarDetailsColumn.nativeElement.childElementCount).toEqual(3);

    const calendarName = fixture.debugElement.query(By.css('.calendar-name span'));
    const calendarTimeZone = fixture.debugElement.query(By.css('.calendar-time-zone span'));
    const isPrivateCalendar = fixture.debugElement.query(By.css('.is-private-calendar mat-icon'));

    expect(calendarName).toBeTruthy();
    expect(calendarName.nativeElement.textContent).toEqual('Calendar N°1');
    expect(calendarTimeZone).toBeTruthy();
    expect(calendarTimeZone.nativeElement.textContent).toEqual('Africa/Tunis');
    expect(isPrivateCalendar).toBeTruthy();
    expect(isPrivateCalendar.nativeElement.textContent).toEqual('public');
  });

  it('should display the selected calendar details correctly', () => {
    component.pageSize = 2;
    component.ngOnChanges({ calendarsList: new SimpleChange(calendarsList, undefined, true) });
    fixture.detectChanges();

    const calendarsCardContent = fixture.debugElement.query(By.css('.all-calendars-card'));
    expect(calendarsCardContent).toBeTruthy();
    const allCalendars = fixture.debugElement.queryAll(By.css('.calendar-details-content'));
    const calendarName = fixture.debugElement.queryAll(By.css('.calendar-name'));
    const calendarTimeZone = fixture.debugElement.queryAll(By.css('.calendar-time-zone'));
    const isPrivateCalendar = fixture.debugElement.queryAll(By.css('.is-private-calendar'));

    expect(calendarsCardContent.nativeElement.childElementCount).toEqual(2);
    expect(allCalendars.length).toEqual(calendarsList.length);
    expect(calendarName.length).toEqual(calendarsList.length);
    expect(calendarName[0].nativeElement.textContent).toEqual('Calendar N°1');
    expect(calendarName[1].nativeElement.textContent).toEqual('Calendar N°2');
    expect(calendarTimeZone.length).toEqual(calendarsList.length);
    expect(calendarTimeZone[0].nativeElement.textContent).toEqual('Africa/Tunis');
    expect(calendarTimeZone[1].nativeElement.textContent).toEqual('Africa/Tunis');
    expect(isPrivateCalendar.length).toEqual(calendarsList.length);
    expect(isPrivateCalendar[0].nativeElement.textContent).toEqual('public');
    expect(isPrivateCalendar[1].nativeElement.textContent).toEqual('lock');

    expect(allCalendars[0].classes).toEqual({ selected: true, 'calendar-details-content': true });

    let selectedCalendarName = calendarName[0];
    expect(selectedCalendarName.nativeElement.textContent).toEqual('Calendar N°1');

    let selectedCalendarTimeZone = calendarTimeZone[0];
    expect(selectedCalendarTimeZone.nativeElement.textContent).toEqual('Africa/Tunis');

    let selectedCalendarPrivacy = isPrivateCalendar[0];
    expect(selectedCalendarPrivacy.nativeElement.textContent).toEqual('public');

    component.selectedCalendarId = 2;
    fixture.detectChanges();

    expect(allCalendars[1].classes).toEqual({ selected: true, 'calendar-details-content': true });

    selectedCalendarName = calendarName[1];
    expect(selectedCalendarName.nativeElement.textContent).toEqual('Calendar N°2');

    selectedCalendarTimeZone = calendarTimeZone[1];
    expect(selectedCalendarTimeZone.nativeElement.textContent).toEqual('Africa/Tunis');

    selectedCalendarPrivacy = isPrivateCalendar[1];
    expect(selectedCalendarPrivacy.nativeElement.textContent).toEqual('lock');
  });
});
