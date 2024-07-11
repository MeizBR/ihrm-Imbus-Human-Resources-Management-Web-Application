import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { AllLeavesCardComponent } from './all-leaves-card.component';

import { LeaveDetails } from '../../../../shared/models';
import { LeaveType } from '../../../../shared/enum/leave-type.enum';
import { LeaveState } from '../../../../shared/enum/leave-state.enum';
import { DatesDiffPipe } from '../../../../shared/pipes/dates-diff.pipe';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AllLeavesCardComponent', () => {
  let component: AllLeavesCardComponent;
  let fixture: ComponentFixture<AllLeavesCardComponent>;

  const selectedLeaveId = 1;
  const leaveList = [
    {
      id: 1,
      start: new Date('2021-01-01T15:53:09.703Z'),
      isHalfDayStart: false,
      end: new Date('2021-02-02T15:53:09.703Z'),
      isHalfDayEnd: false,
      userId: 1,
      leaveType: LeaveType.Sick,
      description: 'Description of the first leave',
      state: LeaveState.Pending,
      comment: 'This leave is waiting for approvement',
      userName: 'userName N°1',
      calendarName: 'calendarName N°1',
    },
  ];

  const pageSize = 1;
  const pageLength = 10;
  const splicedData: LeaveDetails[] = [
    {
      id: 1,
      start: new Date('2021-01-01T15:53:09.703Z'),
      isHalfDayStart: true,
      end: new Date('2021-02-02T15:53:09.703Z'),
      isHalfDayEnd: true,
      userId: 1,
      leaveType: LeaveType.Sick,
      description: 'Description of the first leave',
      state: LeaveState.Pending,
      comment: 'This leave is waiting for approvement',
      userName: 'userName N°1',
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllLeavesCardComponent, DatesDiffPipe],
      imports: [AngularMaterialModule, BrowserAnimationsModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllLeavesCardComponent);
    component = fixture.componentInstance;
    component.leaveList = leaveList;
    component.selectedLeaveId = selectedLeaveId;
    component.pageSize = pageSize;
    component.pageLength = pageLength;
    component.splicedData = splicedData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a card with the correct data', () => {
    const allLeavesCard = fixture.debugElement.query(By.css('.all-leaves-card'));
    expect(allLeavesCard).toBeTruthy();

    const allLeavesCardHeaderText = fixture.debugElement.query(By.css('.all-leaves-card-header-text'));
    expect(allLeavesCardHeaderText).toBeTruthy();

    const allLeavesCardTitle = fixture.debugElement.query(By.css('.all-leaves-card-title'));
    expect(allLeavesCardTitle.nativeElement.textContent).toEqual('LEAVES_VIEW.EDIT_LEAVE.LEAVES_LIST.ALL_LEAVES');

    const allLeavesCardContent = fixture.debugElement.query(By.css('.all-leaves-card-content'));
    expect(allLeavesCardContent).toBeTruthy();

    const leaveDetailsContent = fixture.debugElement.query(By.css('.leave-details-content'));
    expect(leaveDetailsContent).toBeTruthy();
    expect(leaveDetailsContent.classes.selected).toEqual(true);

    const paginator = fixture.debugElement.query(By.css('mat-paginator'));
    expect(paginator).toBeTruthy();
    expect(paginator.componentInstance.pageSize).toEqual(1);
    expect(paginator.componentInstance.length).toEqual(10);
  });
});
