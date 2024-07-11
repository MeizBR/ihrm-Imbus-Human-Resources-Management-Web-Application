import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { StoreModule } from '@ngrx/store';
import { reducers } from '../../../core/reducers';

import { HeaderComponent } from './header.component';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
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
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    component.userSession = {
      workspaceId: 1,
      userId: 1,
      fullName: 'John Dao',
      token: 'ABCD',
      globalRoles: ['Administrator'],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the toolbar correclty', () => {
    const headerContainer = fixture.debugElement.query(By.css('.header-container'));
    expect(headerContainer).toBeTruthy();

    const headerToolbar = fixture.debugElement.query(By.css('.header-container mat-toolbar'));
    expect(headerToolbar).toBeTruthy();
    expect(headerToolbar.nativeElement.childElementCount).toEqual(2);

    const appNameContainer = fixture.debugElement.query(By.css('.app-name-container'));
    expect(appNameContainer).toBeTruthy();
    expect(appNameContainer.nativeElement.childElementCount).toEqual(2);

    const appNameSpans = fixture.debugElement.queryAll(By.css('.app-name-container span'));
    expect(appNameSpans.length).toEqual(2);
    expect(appNameSpans[0].nativeElement.textContent).toEqual('iHRM');
    expect(appNameSpans[1].nativeElement.textContent).toEqual('imbus Human Resources Management');

    component.isTimerStopped = true;
    fixture.detectChanges();

    let userNameContainer = fixture.debugElement.query(By.css('.user-name-container'));
    expect(userNameContainer).toBeTruthy();
    expect(userNameContainer.nativeElement.childElementCount).toEqual(1);

    let timerSection = fixture.debugElement.query(By.css('.timer-section'));
    expect(timerSection).toBeFalsy();

    component.isTimerStopped = false;
    component.currentTime = '01:50:20';
    fixture.detectChanges();

    userNameContainer = fixture.debugElement.query(By.css('.user-name-container'));
    expect(userNameContainer).toBeTruthy();
    expect(userNameContainer.nativeElement.childElementCount).toEqual(2);

    timerSection = fixture.debugElement.query(By.css('.timer-section'));
    expect(timerSection).toBeTruthy();
    expect(timerSection.nativeElement.childElementCount).toEqual(2);

    const stopButton = fixture.debugElement.query(By.css('.timer-section button'));
    expect(stopButton).toBeTruthy();
    expect(stopButton.nativeElement.textContent).toEqual('pause_circle_outline');

    const timerLabel = fixture.debugElement.query(By.css('.timer-section .label'));
    expect(timerLabel).toBeTruthy();
    expect(timerLabel.nativeElement.textContent).toEqual('01:50:20');
    expect(timerLabel.attributes['ng-reflect-router-link']).toEqual('timeTracker/');

    const userNameSection = fixture.debugElement.query(By.css('.user-name-section'));
    expect(userNameSection).toBeTruthy();
    expect(userNameSection.nativeElement.childElementCount).toEqual(3);

    const userButton = fixture.debugElement.query(By.css('.user-name-section button'));
    expect(userButton).toBeTruthy();
    expect(userButton.nativeElement.textContent).toEqual('person');

    const userDetailsRoles = fixture.debugElement.query(By.css('.user-details-roles'));
    expect(userDetailsRoles).toBeTruthy();
    expect(userDetailsRoles.nativeElement.childElementCount).toEqual(2);

    const userName = fixture.debugElement.query(By.css('.user-name'));
    expect(userName).toBeTruthy();
    expect(userName.nativeElement.textContent).toEqual('John Dao');

    const userGlobalRoles = fixture.debugElement.query(By.css('.user-roles'));
    expect(userGlobalRoles).toBeTruthy();
    expect(userGlobalRoles.nativeElement.textContent).toEqual('Administrator');
  });
});
