import { By } from '@angular/platform-browser';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { CustomersHeaderComponent } from './customers-header.component';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('CustomersHeaderComponent', () => {
  let component: CustomersHeaderComponent;
  let fixture: ComponentFixture<CustomersHeaderComponent>;
  let tabGroup: MatTabGroup;
  let tabs: MatTab[];
  let usersTab: MatTab;
  let userDetailsTab: MatTab;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomersHeaderComponent],
      imports: [AngularMaterialModule, RouterTestingModule, TranslateModule.forRoot(), BrowserAnimationsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomersHeaderComponent);
    component = fixture.componentInstance;
    component.selectedIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct header data', () => {
    const userHeaderContainer = fixture.debugElement.query(By.css('.customers-header-container'));
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
    expect(usersTab.textLabel).toEqual('Customers');

    expect(userDetailsTab.position).toEqual(1);
    expect(userDetailsTab.disabled).toEqual(true);
    expect(userDetailsTab.textLabel).toEqual('Customer Details');

    component.selectedIndex = 1;
    fixture.detectChanges();

    expect(tabGroup.selectedIndex).toEqual(1);
  });
});
