import { By } from '@angular/platform-browser';
import { MatSidenav } from '@angular/material/sidenav';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';

import { reducers } from '../../../core/reducers';

import { CalendarsComponent } from './calendars.component';
import { AngularMaterialModule } from '../../../shared/angular-material/angular-material.module';

describe('CalendarsComponent', () => {
  let component: CalendarsComponent;
  let fixture: ComponentFixture<CalendarsComponent>;
  let sideNav: MatSidenav;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarsComponent],
      imports: [
        AngularMaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the side nav correctly', () => {
    const menuButton = fixture.debugElement.query(By.css('.menu-button button'));
    expect(menuButton).toBeTruthy();
    expect(menuButton.nativeElement.textContent).toEqual('menu');

    sideNav = fixture.debugElement.query(By.css('mat-sidenav')).componentInstance;
    expect(sideNav).toBeTruthy();
    expect(sideNav.opened).toEqual(false);

    menuButton.nativeElement.click();
    fixture.detectChanges();
    expect(sideNav.opened).toEqual(true);
  });
});
