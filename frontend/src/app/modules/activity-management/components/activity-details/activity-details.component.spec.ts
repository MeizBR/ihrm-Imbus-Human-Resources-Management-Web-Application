import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';

import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

import { QuillModule } from 'ngx-quill';

import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';
import { ActivityDetailsComponent } from './activity-details.component';
import { ActivityDetails } from '../../../../shared/models';
import { SelectItemComponent } from '../../../../shared/component/select-item/select-item.component';
import { SearchFilterPipe } from '../../../../shared/custom-pipes/search-filter.pipe';

describe('ActivityDetailsComponent', () => {
  let component: ActivityDetailsComponent;
  let fixture: ComponentFixture<ActivityDetailsComponent>;
  const currentActivity: ActivityDetails = {
    id: 1,
    userId: 1,
    projectId: 1,
    description: 'First ADD WORKING description',
    start: '01-01-2021',
    end: '',
    projectName: '',
    workDuration: '',
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityDetailsComponent, SelectItemComponent, SearchFilterPipe],
      imports: [
        AngularMaterialModule,
        BrowserAnimationsModule,
        MatIconModule,
        FlexLayoutModule,
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule,
        QuillModule.forRoot(),
      ],
      providers: [DatePipe],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityDetailsComponent);
    component = fixture.componentInstance;

    component.currentTime = '00:40:00';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Current activity details', () => {
    beforeEach(() => {
      component.isCurrent = true;
      fixture.detectChanges();
    });

    it('should display the add project anchor according to the selected project AND activity', () => {
      component.activity = null;
      component.currentSelectedProject = null;
      fixture.detectChanges();

      let addProjectAnchor = fixture.debugElement.query(By.css('.add-project span'));
      expect(addProjectAnchor).toBeTruthy();
      expect(addProjectAnchor.properties.innerText).toEqual('TIME_TRACKER_VIEW.PROJECT');

      expect(fixture.debugElement.query(By.css('.current-project .project-name'))).toBeFalsy();

      let addIcon = fixture.debugElement.query(By.css('.add-project mat-icon'));
      expect(addIcon).toBeTruthy();
      expect(addIcon.properties.innerText).toEqual('add_circle_outline');

      component.currentSelectedProject = { id: 1, customerId: 1, name: 'Project 1', description: 'Description of project name', isActive: true };
      component.activity = { id: 1, userId: 1, projectId: 1, description: '', start: '01-01-2021', end: '', projectName: 'Project name', workDuration: '' };
      fixture.detectChanges();

      addProjectAnchor = fixture.debugElement.query(By.css('.add-project span'));
      expect(addProjectAnchor).toBeFalsy();
      const projectAnchor = fixture.debugElement.query(By.css('.current-project .project-name span'));
      expect(projectAnchor).toBeTruthy();
      expect(projectAnchor.properties.innerText).toEqual('Project name');

      addIcon = fixture.debugElement.query(By.css('.current-project .project-name mat-icon'));
      expect(addIcon).toBeTruthy();
      expect(addIcon.properties.innerText).toEqual('lens');

      // FIXME: IT miss the project update
      // fixture.debugElement.query(By.css('.project-name')).nativeElement.click()
      // fixture.detectChanges();
      // const projectsFilter = fixture.debugElement.query(By.css('app-select-item'))
      // expect(projectsFilter.componentInstance).toBeDefined();
      // expect(projectsFilter).toBeTruthy();
      // expect(projectsFilter.query(By.css('.search-div .search-form-field input')).attributes.placeholder).toEqual('TIME_TRACKER_VIEW.PROJECT_LIST.FILTER');

      // expect(projectsFilter.query(By.css('.no-data-span'))).toBeFalsy() // attributes.placeholder).toEqual('TIME_TRACKER_VIEW.PROJECT_LIST.NO_DATA..');
      // fixture.debugElement.query(By.css('.project-name')).nativeElement.click()
      // fixture.detectChanges();

      // fixture.debugElement.query(By.css('.project-name')).nativeElement.click()
      // component.projects = [];
      // component.currentSelectedProject = undefined;
      // component.activity = undefined;
      // fixture.detectChanges();
      // fixture.debugElement.query(By.css('.add-project')).nativeElement.click()
      // fixture.detectChanges();
      // expect(projectsFilter.query(By.css('.search-div .search-form-field input')).attributes.placeholder).toEqual('TIME_TRACKER_VIEW.PROJECT_LIST.FILTER');
    });

    it('should update the activity correctly according to the input data', async(() => {
      expect(fixture.debugElement.query(By.css('.activity-details .data-container'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.activity-details .data-container .description-field'))).toBeTruthy();

      const input = fixture.debugElement.query(By.css('.activity-details .data-container .description-field .input'));
      expect(input).toBeTruthy();
      expect(input.attributes.placeholder).toEqual('TIME_TRACKER_VIEW.ADD_WORKING');
      expect(input.properties.type).toEqual('text');
      expect(input.properties.value).toEqual('');

      component.activity = currentActivity;
      fixture.detectChanges();
      expect(input.properties.value).toEqual('First ADD WORKING description');

      const spyUpdate = spyOn(component, 'updateActivity');
      input.nativeElement.dispatchEvent(new Event('change'));

      expect(spyUpdate).toHaveBeenCalled();
    }));

    it('should display the buttons according to activity status the timing details correctly', () => {
      const currentTimeLabel = fixture.debugElement.query(By.css('.activity-details .timing-container .time-condition div .label'));
      expect(currentTimeLabel.properties.innerText).toEqual('00:40:00');
      component.activity = null;
      component.currentSelectedProject = null;
      fixture.detectChanges();

      const spyOnStartActivity = spyOn(component, 'startActivity');
      const startButton = fixture.debugElement.query(By.css('.activity-details .timing-container .timing-actions .start-button'));
      expect(startButton).toBeTruthy();

      expect(startButton.attributes.color).toEqual('primary');
      expect(startButton.properties.disabled).toEqual(true);
      expect(startButton.properties.innerText).toEqual('TIME_TRACKER_VIEW.START');

      component.currentSelectedProject = { id: 1, customerId: 1, name: 'Project name', description: 'Description of project name', isActive: true };
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('.activity-details .data-container .description-field .input'));
      startButton.nativeElement.click();
      expect(spyOnStartActivity).toHaveBeenCalledWith(input.properties.value, 1);

      component.activity = { id: 1, userId: 1, projectId: 1, description: 'First ADD WORKING description', start: '01-01-2021', end: '', projectName: '', workDuration: '' };
      fixture.detectChanges();

      const spyOnStopActivity = spyOn(component.onStopCurActivity, 'emit');

      const stopButton = fixture.debugElement.query(By.css('.activity-details .timing-container .timing-actions .stop-button'));
      expect(stopButton).toBeTruthy();
      expect(stopButton.attributes.color).toEqual('warn');
      expect(stopButton.properties.innerText).toEqual('TIME_TRACKER_VIEW.STOP');

      stopButton.nativeElement.click();
      expect(spyOnStopActivity).toHaveBeenCalled();

      const spyOnDeleteActivity = spyOn(component.onDeleteActivity, 'emit');
      const deleteButton = fixture.debugElement.query(By.css('.activity-details .timing-container .timing-actions mat-icon'));
      expect(deleteButton.properties.innerText).toEqual('clear');
      deleteButton.nativeElement.click();

      expect(spyOnDeleteActivity).toHaveBeenCalledWith(1);

      component.activity = null;
      fixture.detectChanges();

      const deleteButtonTimer = fixture.debugElement.query(By.css('.activity-details .timing-container .timing-actions .timer'));
      expect(deleteButtonTimer.properties.innerText).toEqual('timer');
      deleteButton.nativeElement.click();
      expect(spyOnDeleteActivity).toHaveBeenCalledWith(1);
    });
  });

  describe('Activities history details', () => {
    beforeEach(() => {
      component.isCurrent = false;
      fixture.detectChanges();
    });

    it('should update the activity correctly according to the input data', () => {
      const activity = { id: 1, userId: 1, projectId: 1, description: 'First description', start: '01-01-2021', end: '', projectName: '', workDuration: '' };
      expect(fixture.debugElement.query(By.css('.activity-details .data-container'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.activity-details .data-container .description-field'))).toBeTruthy();

      const input = fixture.debugElement.query(By.css('.activity-details .data-container .description-field .input'));
      expect(input).toBeTruthy();
      expect(input.attributes.placeholder).toEqual('TIME_TRACKER_VIEW.ADD_DESCRIPTION');
      expect(input.properties.type).toEqual('text');
      expect(input.properties.value).toEqual('');

      component.activity = activity;
      fixture.detectChanges();

      input.nativeElement.value = 'First description';
      expect(input.properties.value).toEqual('First description');

      const spyUpdate = spyOn(component, 'updateActivity');
      input.nativeElement.dispatchEvent(new Event('change'));

      expect(spyUpdate).toHaveBeenCalledWith('First description', activity);

      input.nativeElement.value = 'Updated description';
      expect(input.properties.value).toEqual('Updated description');

      input.nativeElement.dispatchEvent(new Event('change'));

      expect(spyUpdate).toHaveBeenCalledWith('Updated description', activity);
    });

    it('should display the Project Name in the activities list', () => {
      const activity = { id: 1, userId: 1, projectId: 1, description: 'First add description', start: '01-01-2021', end: '', projectName: 'Project name', workDuration: '' };
      component.activity = activity;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.activity-details .project-field .current-project'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('.activity-details .project-field .activity-project'))).toBeTruthy();

      const matIcon = fixture.debugElement.query(By.css('.activity-details .project-field .activity-project .matMenuTrigger mat-icon'));
      expect(matIcon).toBeTruthy();
      expect(matIcon.properties.innerText).toEqual('lens');

      let projectName = fixture.debugElement.query(By.css('.activity-details .project-field .activity-project .matMenuTrigger span'));
      expect(projectName).toBeTruthy();
      expect(projectName.properties.innerText).toEqual('Project name');

      component.activity = { ...activity, projectName: 'Updated Project Name' };
      fixture.detectChanges();
      projectName = fixture.debugElement.query(By.css('.activity-details .project-field .activity-project .matMenuTrigger span'));
      expect(projectName).toBeTruthy();
      expect(projectName.properties.innerText).toEqual('Updated Project Name');
    });

    it('should display timing details correctly', () => {
      const datePipe = new DatePipe('en');
      const date1 = new Date('2022-06-01T13:44:59.542Z');
      const date2 = new Date('2022-06-01T15:46:53.136Z');
      const activity = {
        id: 1,
        userId: 1,
        projectId: 1,
        description: 'some tests',
        start: date1.toISOString(),
        end: date2.toISOString(),
        projectName: 'Project 1',
        workDuration: '02:02:00',
      };
      component.activity = activity;
      fixture.detectChanges();

      const startEndTime = fixture.debugElement.query(By.css('.activity-details .timing-container .time-condition .timing-labels .activity-start-end'));
      expect(startEndTime.properties.innerText).toEqual(datePipe.transform(activity.start, 'shortTime') + ' - ' + datePipe.transform(activity.end, 'shortTime'));

      const workDuration = fixture.debugElement.query(By.css('.activity-details .timing-container .time-condition .timing-labels .activity-duration .activity-duration-label'));
      expect(workDuration).toBeTruthy();
      expect(workDuration.properties.innerText).toEqual('02:02:00');

      const playButton = fixture.debugElement.query(By.css('.activity-details .timing-container .activity-buttons .play-button'));
      const spyOnPlayButton = spyOn(component.onRestartActivity, 'emit');
      expect(playButton).toBeTruthy();
      expect(playButton.attributes['mat-flat-button']).toBeDefined();
      expect(playButton.properties.innerText).toEqual('play_arrow');
      playButton.triggerEventHandler('mousedown', {});

      const playButtonIcon = playButton.query(By.css('mat-icon'));
      expect(playButtonIcon).toBeTruthy();
      expect(spyOnPlayButton).toHaveBeenCalledWith(activity);

      const deleteButton = fixture.debugElement.query(By.css('.activity-details .timing-container .activity-buttons .delete-button'));
      const spyOnDeleteButton = spyOn(component.onDeleteActivity, 'emit');
      expect(deleteButton.attributes['mat-flat-button']).toBeDefined();
      expect(deleteButton.properties.innerText).toEqual('delete');

      const deleteButtonIcon = fixture.debugElement.query(By.css('.activity-details .timing-container .activity-buttons .delete-button mat-icon'));
      expect(deleteButtonIcon.attributes.color).toEqual('warn');

      deleteButton.nativeElement.click();
      expect(spyOnDeleteButton).toHaveBeenCalledWith(component.activity.id);
    });
  });
});
