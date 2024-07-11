import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UserHeaderComponent } from './user-header.component';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('UserHeaderComponent', () => {
  let component: UserHeaderComponent;
  let fixture: ComponentFixture<UserHeaderComponent>;
  let tabGroup: MatTabGroup;
  let tabs: MatTab[];
  let usersTab: MatTab;
  let userDetailsTab: MatTab;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserHeaderComponent],
      imports: [RouterTestingModule, AngularMaterialModule, BrowserAnimationsModule, TranslateModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserHeaderComponent);
    component = fixture.componentInstance;
    component.selectedIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct header data', () => {
    const userHeaderContainer = fixture.debugElement.query(By.css('.user-header-container'));
    tabGroup = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;
    tabs = tabGroup._tabs.toArray();

    expect(userHeaderContainer).toBeTruthy();
    expect(tabGroup).toBeTruthy();
    expect(tabs).toBeTruthy();
    expect(tabs.length).toEqual(2);

    usersTab = tabs[0];
    userDetailsTab = tabs[1];

    expect(tabGroup.selectedIndex).toEqual(0);

    expect(usersTab.position).toEqual(0);
    expect(usersTab.textLabel).toEqual('Users');

    expect(userDetailsTab.position).toEqual(1);
    expect(userDetailsTab.disabled).toEqual(true);
    expect(userDetailsTab.textLabel).toEqual('User Details');

    component.selectedIndex = 1;
    fixture.detectChanges();

    expect(tabGroup.selectedIndex).toEqual(1);
  });
});
