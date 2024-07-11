import { By } from '@angular/platform-browser';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { EventHeaderComponent } from './event-header.component';
import { EventsListComponent } from '../../events-list/events-list.component';

import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('EventHeaderComponent', () => {
  let component: EventHeaderComponent;
  let fixture: ComponentFixture<EventHeaderComponent>;

  let tabGroup: MatTabGroup;
  let tabs: MatTab[];
  let eventsTab: MatTab;
  let eventDetailsTab: MatTab;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventHeaderComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: 'home/events', component: EventsListComponent }]),
        AngularMaterialModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventHeaderComponent);
    component = fixture.componentInstance;
    component.selectedIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct header data', () => {
    const eventHeaderContainer = fixture.debugElement.query(By.css('.event-header-container'));
    tabGroup = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;
    tabs = tabGroup._tabs.toArray();

    expect(eventHeaderContainer).toBeTruthy();
    expect(tabGroup).toBeTruthy();
    expect(tabs).toBeTruthy();
    expect(tabs.length).toEqual(2);

    eventsTab = tabs[0];
    eventDetailsTab = tabs[1];

    expect(tabGroup.selectedIndex).toEqual(0);

    expect(eventsTab.position).toEqual(0);
    expect(eventsTab.textLabel).toEqual('Events');

    expect(eventDetailsTab.position).toEqual(1);
    expect(eventDetailsTab.disabled).toEqual(true);
    expect(eventDetailsTab.textLabel).toEqual('Event Details');

    component.selectedIndex = 1;
    fixture.detectChanges();

    expect(tabGroup.selectedIndex).toEqual(1);
  });
});
