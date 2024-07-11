import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopActivitiesListComponent } from './top-activities-list.component';

describe('TopAcitivitiesListComponent', () => {
  let component: TopActivitiesListComponent;
  let fixture: ComponentFixture<TopActivitiesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopActivitiesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopActivitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
