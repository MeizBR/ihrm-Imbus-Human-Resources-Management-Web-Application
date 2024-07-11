import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTaskSummaryComponent } from './card-task-summary.component';

xdescribe('CardTaskSummaryComponent', () => {
  let component: CardTaskSummaryComponent;
  let fixture: ComponentFixture<CardTaskSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CardTaskSummaryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardTaskSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
