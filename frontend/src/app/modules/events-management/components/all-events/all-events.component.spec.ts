import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { AllEventsComponent } from './all-events.component';

import { EventDetails } from '../../../../shared/models';
import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { DatesDiffPipe } from '../../../../shared/pipes/dates-diff.pipe';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AllEventsComponent', () => {
  let component: AllEventsComponent;
  let fixture: ComponentFixture<AllEventsComponent>;

  const selectedEventId = 1;
  const eventList: EventDetails[] = [
    {
      id: 1,
      calendarId: 1,
      calendarName: 'Calendar N° 1',
      start: new Date('2021-01-01T15:53:09.703Z'),
      end: new Date('2021-02-02T15:53:09.703Z'),
      title: 'Event N° 1',
      description: 'Description of the first event',
      repetition: Repetitive.Monthly,
      allDay: true,
      eventType: EventType.Meeting,
    },
  ];

  const pageSize = 1;
  const pageLength = 10;
  const splicedData: EventDetails[] = [
    {
      id: 1,
      calendarId: 1,
      calendarName: 'Calendar N° 1',
      start: new Date('2021-01-01T15:53:09.703Z'),
      end: new Date('2021-02-02T15:53:09.703Z'),
      title: 'Event N° 1',
      description: 'Description of the first event',
      repetition: Repetitive.Monthly,
      allDay: true,
      eventType: EventType.Meeting,
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllEventsComponent, DatesDiffPipe],
      imports: [AngularMaterialModule, BrowserAnimationsModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllEventsComponent);
    component = fixture.componentInstance;
    component.pageSize = pageSize;
    component.eventList = eventList;
    component.pageLength = pageLength;
    component.splicedData = splicedData;
    component.selectedEventId = selectedEventId;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a card with the correct data', () => {
    const allEventsCard = fixture.debugElement.query(By.css('.all-events-card'));
    expect(allEventsCard).toBeTruthy();

    const allEventsCardHeaderText = fixture.debugElement.query(By.css('.all-events-card-header-text'));
    expect(allEventsCardHeaderText).toBeTruthy();

    const allEventsCardTitle = fixture.debugElement.query(By.css('.all-events-card-title'));
    expect(allEventsCardTitle.nativeElement.textContent).toEqual('EVENTS_VIEW.EDIT_EVENT.ALL_EVENTS');

    const allEventsCardContent = fixture.debugElement.query(By.css('.all-events-card-content'));
    expect(allEventsCardContent).toBeTruthy();

    const eventDetailsContent = fixture.debugElement.query(By.css('.event-details-content'));
    expect(eventDetailsContent).toBeTruthy();
    expect(eventDetailsContent.classes.selected).toEqual(true);

    const paginator = fixture.debugElement.query(By.css('mat-paginator'));
    expect(paginator).toBeTruthy();
    expect(paginator.componentInstance.pageSize).toEqual(1);
    expect(paginator.componentInstance.length).toEqual(10);
  });
});
