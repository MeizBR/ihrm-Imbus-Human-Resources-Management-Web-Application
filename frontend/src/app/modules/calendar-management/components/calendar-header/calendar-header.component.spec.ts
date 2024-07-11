import { By } from '@angular/platform-browser';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { CalendarHeaderComponent } from './calendar-header.component';
import { CalendarsComponent } from '../../calendars/calendars.component';
import { CalendarsListComponent } from '../../calendars-list/calendars-list.component';
import { CalendarDetailsComponent } from '../../calendar-details/calendar-details.component';

import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('CalendarHeaderComponent', () => {
  let component: CalendarHeaderComponent;
  let fixture: ComponentFixture<CalendarHeaderComponent>;
  let tabGroup: MatTabGroup;
  let tabs: MatTab[];
  let calendarsTab: MatTab;
  let calendarDetailsTab: MatTab;
  let calendarsManagementTab: MatTab;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'home/calendars', component: CalendarsComponent },
          { path: 'home/calendars/calendar', component: CalendarDetailsComponent },
          { path: 'home/calendars/calendars-management', component: CalendarsListComponent },
        ]),
        AngularMaterialModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
      ],
      declarations: [CalendarHeaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarHeaderComponent);
    component = fixture.componentInstance;
    component.selectedIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct header data', () => {
    const calendarHeaderContainer = fixture.debugElement.query(By.css('.calendar-header-container'));
    tabGroup = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;
    tabs = tabGroup._tabs.toArray();

    expect(calendarHeaderContainer).toBeTruthy();
    expect(tabGroup).toBeTruthy();
    expect(tabs).toBeTruthy();
    expect(tabs.length).toEqual(3);

    calendarsTab = tabs[0];
    calendarsManagementTab = tabs[1];
    calendarDetailsTab = tabs[2];

    expect(tabGroup.selectedIndex).toEqual(0);
    expect(calendarsTab.position).toEqual(0);
    expect(calendarsTab.textLabel).toEqual('Calendars');

    expect(calendarsManagementTab.position).toEqual(1);
    expect(calendarsManagementTab.textLabel).toEqual('Calendar Management');

    expect(calendarDetailsTab.position).toEqual(2);
    expect(calendarDetailsTab.disabled).toEqual(true);
    expect(calendarDetailsTab.textLabel).toEqual('Calendar Details');

    component.selectedIndex = 1;
    fixture.detectChanges();

    expect(tabGroup.selectedIndex).toEqual(1);

    component.selectedIndex = 2;
    fixture.detectChanges();

    expect(tabGroup.selectedIndex).toEqual(2);
  });
});
