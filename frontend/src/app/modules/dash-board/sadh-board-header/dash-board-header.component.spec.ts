import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashBoardHeaderComponent } from './dash-board-header.component';

describe('SadhBoardHeaderComponent', () => {
  let component: DashBoardHeaderComponent;
  let fixture: ComponentFixture<DashBoardHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashBoardHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashBoardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
