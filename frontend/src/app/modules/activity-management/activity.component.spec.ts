import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoItemsComponent } from 'src/app/shared/component/no-items/no-items.component';
import { MatDialog } from '@angular/material/dialog';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as lodash from 'lodash';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { metaReducers, reducers } from '../../core/reducers/index';
import { ActivityComponent } from './activity.component';
import { ActivityDetails } from '../../shared/models';
import { SearchFilterPipe } from '../../shared/custom-pipes/search-filter.pipe';
import { AngularMaterialModule } from '../../shared/angular-material/angular-material.module';
import { ActivityDetailsComponent } from './components/activity-details/activity-details.component';
import { SelectItemComponent } from '../../shared/component/select-item/select-item.component';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
  let activityDetails: ActivityDetailsComponent;
  const mockCurrentTime = '00:40:00';
  const mockDaysOfActivities = ['Tue 04 Oct', 'Mon 11 Avr'];
  const mockActivitiesByDay: lodash.Dictionary<{ activities: ActivityDetails[]; totalWork: string }> = {};
  mockActivitiesByDay['Tue 04 Oct'] = {
    activities: [
      {
        id: 1,
        userId: 2,
        projectId: 1,
        description: 'description of first activity',
        start: '2022-10-04T08:47:21.616Z',
        end: '2022-10-04T09:28:36.687Z',
        workDuration: '10:10:12',
      },
    ],
    totalWork: '10:50:12',
  };

  mockActivitiesByDay['Mon 11 Avr'] = {
    activities: [
      {
        id: 2,
        userId: 2,
        projectId: 2,
        description: 'description of second activity',
        start: '2022-04-11T06:17:01.616Z',
        end: '2022-04-11T09:31:30.687Z',
        workDuration: '08:00:00',
      },
    ],
    totalWork: '05:10:00',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers, {
          metaReducers,
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        TranslateModule.forRoot(),
        AngularMaterialModule,
        BrowserAnimationsModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ActivityComponent, SelectItemComponent, SearchFilterPipe, ActivityDetailsComponent, NoItemsComponent],
      providers: [{ provide: MatDialog, useValue: {} }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    component.currentTime = mockCurrentTime;
    component.daysOfActivities = mockDaysOfActivities;
    component.activitiesByDay = mockActivitiesByDay;
    activityDetails = fixture.debugElement.query(By.directive(ActivityDetailsComponent)).componentInstance;

    fixture.detectChanges();
    component.currentActivity = { id: 1, userId: 1, projectId: 1, description: '', start: '01-01-2021', end: '', projectName: 'Project name', workDuration: '' };
    component.currentSelectedProject = { id: 1, customerId: 1, name: 'Project name', description: 'Description of project name', isActive: true };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle the activity details component correctly', () => {
    expect(activityDetails.activity).toBeDefined();

    expect(activityDetails.currentSelectedProject).toBeDefined();
  });

  it('should display the current activities correctly', () => {
    const activityContainer = fixture.debugElement.query(By.css('.activity-container .current app-activity-details'));
    expect(activityContainer).toBeTruthy();
  });

  it('should display the activities panel correctly', () => {
    component.daysOfActivities = mockDaysOfActivities;
    const matAccordion = fixture.debugElement.query(By.css('.activity-container .panel .panel-headers'));
    expect(matAccordion.attributes.multi).toBeDefined();

    const matExpansionPanel = fixture.debugElement.query(By.css('.activity-container .panel .panel-headers mat-expansion-panel')).componentInstance;
    expect(matExpansionPanel.expanded).toEqual(true);

    const matExpansionPanelHeader = fixture.debugElement.queryAll(By.css('.activity-container .panel .panel-headers mat-expansion-panel mat-expansion-panel-header'));
    expect(matExpansionPanelHeader.length).toBe(2);

    const matPanelTitle = fixture.debugElement.queryAll(By.css('.activity-container .panel .panel-headers mat-expansion-panel mat-expansion-panel-header mat-panel-title'));
    expect(matPanelTitle.length).toBe(2);
    expect(matPanelTitle[0].properties.innerText).toEqual('Tue 04 Oct');
    expect(matPanelTitle[1].properties.innerText).toEqual('Mon 11 Avr');

    const matPanelDescription = fixture.debugElement.queryAll(By.css('.activity-container .panel-headers mat-expansion-panel-header mat-panel-description'));
    expect(matPanelDescription.length).toBe(2);
    expect(matPanelDescription[0].properties.innerText).toEqual('TIME_TRACKER_VIEW.TOTAL_LABEL : 10:50:12');
    expect(matPanelDescription[1].properties.innerText).toEqual('TIME_TRACKER_VIEW.TOTAL_LABEL : 05:10:00');

    const matPanelRow = fixture.debugElement.queryAll(By.css('.activity-container .panel .panel-headers mat-expansion-panel mat-action-row'));
    expect(matPanelRow.length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('.activity-container .panel .panel-headers mat-expansion-panel mat-action-row app-activity-details'))).toBeTruthy();
  });

  it('the message is not displayed until existing of activities', () => {
    const noItems = fixture.debugElement.query(By.css('app-no-items'));
    expect(noItems).not.toBeTruthy();
    fixture.detectChanges();
  });
});
