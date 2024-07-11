import { By } from '@angular/platform-browser';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { LeaveHeaderComponent } from './leave-header.component';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('LeaveHeaderComponent', () => {
  let component: LeaveHeaderComponent;
  let fixture: ComponentFixture<LeaveHeaderComponent>;

  let tabGroup: MatTabGroup;
  let tabs: MatTab[];
  let leavesTab: MatTab;
  let leaveDetailsTab: MatTab;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveHeaderComponent],
      imports: [AngularMaterialModule, TranslateModule.forRoot(), RouterTestingModule, BrowserAnimationsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveHeaderComponent);
    component = fixture.componentInstance;
    component.selectedIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct header data', () => {
    const leaveHeaderContainer = fixture.debugElement.query(By.css('.leave-header-container'));
    tabGroup = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;
    tabs = tabGroup._tabs.toArray();

    expect(leaveHeaderContainer).toBeTruthy();
    expect(tabGroup).toBeTruthy();
    expect(tabs).toBeTruthy();
    expect(tabs.length).toEqual(2);

    leavesTab = tabs[0];
    leaveDetailsTab = tabs[1];

    expect(tabGroup.selectedIndex).toEqual(0);

    expect(leavesTab.position).toEqual(0);
    expect(leavesTab.textLabel).toEqual('Leaves');

    expect(leaveDetailsTab.position).toEqual(1);
    expect(leaveDetailsTab.disabled).toEqual(true);
    expect(leaveDetailsTab.textLabel).toEqual('Leave Details');

    component.selectedIndex = 1;
    fixture.detectChanges();

    expect(tabGroup.selectedIndex).toEqual(1);
  });
});
