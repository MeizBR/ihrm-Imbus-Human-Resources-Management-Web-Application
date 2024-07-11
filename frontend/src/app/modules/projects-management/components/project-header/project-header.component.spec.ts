import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';

import { reducers } from '../../../../core/reducers';

import { ProjectHeaderComponent } from './project-header.component';

import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('ProjectHeaderComponent', () => {
  let component: ProjectHeaderComponent;
  let fixture: ComponentFixture<ProjectHeaderComponent>;
  let tabGroup: MatTabGroup;
  let tabs: MatTab[];
  let projectsTab: MatTab;
  let projectRolesTab: MatTab;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectHeaderComponent],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        AngularMaterialModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectHeaderComponent);
    component = fixture.componentInstance;
    component.selectedIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct header data', () => {
    const projectHeaderContainer = fixture.debugElement.query(By.css('.project-header-container'));
    tabGroup = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;
    tabs = tabGroup._tabs.toArray();

    expect(projectHeaderContainer).toBeTruthy();
    expect(tabGroup).toBeTruthy();
    expect(tabs).toBeTruthy();
    expect(tabs.length).toEqual(2);

    projectsTab = tabs[0];
    projectRolesTab = tabs[1];

    expect(tabGroup.selectedIndex).toEqual(0);

    expect(projectsTab.position).toEqual(0);
    expect(projectsTab.textLabel).toEqual('Projects');

    expect(projectRolesTab.position).toEqual(1);
    expect(projectRolesTab.disabled).toEqual(true);
    expect(projectRolesTab.textLabel).toEqual('Project Details');

    component.selectedIndex = 1;
    fixture.detectChanges();

    expect(tabGroup.selectedIndex).toEqual(1);
  });
});
