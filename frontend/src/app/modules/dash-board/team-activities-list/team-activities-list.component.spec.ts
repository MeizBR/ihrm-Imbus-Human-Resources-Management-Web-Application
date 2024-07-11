import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamActivitiesListComponent } from './team-activities-list.component';

describe('TeamActivitiesListComponent', () => {
  let component: TeamActivitiesListComponent;
  let fixture: ComponentFixture<TeamActivitiesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamActivitiesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamActivitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
