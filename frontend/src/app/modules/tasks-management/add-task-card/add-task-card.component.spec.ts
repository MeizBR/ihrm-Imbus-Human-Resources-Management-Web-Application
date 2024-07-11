import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AddTaskCardComponent } from './add-task-card.component';
import { AngularMaterialModule } from '../../../shared/angular-material/angular-material.module';

xdescribe('AddTaskCardComponent', () => {
  let component: AddTaskCardComponent;
  let fixture: ComponentFixture<AddTaskCardComponent>;
  // const mockCardData: CardDetails = {
  //   Id: 'Task 1',
  //   Status: 'Open',
  //   Project: 'Project 1',
  //   Title: 'Task 1',
  //   Type: 'Improvement',
  //   StoryPoints: 1,
  //   Assignee: 'Nancy Davloio',
  //   Priority: 'Low',
  //   Tags: ['Unit test', 'Jasmine', 'Angular'],
  //   Summary: 'Unit test',
  // };

  // const mockStatusData: string[] = ['Open', 'InProgress', 'Review', 'Close'];
  // const mockPriorityData: string[] = ['Critical', 'High', 'Medium', 'Low'];
  // const mockTypeData: string[] = ['Story', 'Task', 'Bug', 'Epic', 'Improvement', 'Others'];
  // const mockAssigneeData: string[] = ['Nancy Davloio', 'Andrew Fuller', 'Janet Leverling', 'Steven walker', 'Robert King', 'Margaret hamilt', 'Michael Suyama'];
  // const mockProjectData: string[] = ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5', 'Project 6'];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddTaskCardComponent],
      imports: [AngularMaterialModule, ReactiveFormsModule, FormsModule, BrowserAnimationsModule, TranslateModule.forRoot()],
      providers: [TranslateService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTaskCardComponent);
    component = fixture.componentInstance;
    // component.cardData = mockCardData;
    // component.statusData = mockStatusData;
    // component.priorityData = mockPriorityData;
    // component.projectData = mockProjectData;
    // component.assigneeData = mockAssigneeData;
    // component.typeData = mockTypeData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //   it('should display the appropriate labels', () => {
  //     const idLabel = fixture.debugElement.query(By.css('#id-label'));
  //     const statusLabel = fixture.debugElement.query(By.css('#status-label'));
  //     const projectLabel = fixture.debugElement.query(By.css('#project-label'));
  //     const typeLabel = fixture.debugElement.query(By.css('#type-label'));
  //     const titleLabel = fixture.debugElement.query(By.css('#title-label'));
  //     const estimationLabel = fixture.debugElement.query(By.css('#estimation-label'));
  //     const assigneeLabel = fixture.debugElement.query(By.css('#assignee-label'));
  //     const priorityLabel = fixture.debugElement.query(By.css('#priority-label'));
  //     const tagsLabel = fixture.debugElement.query(By.css('#tags-label'));
  //     const summaryLabel = fixture.debugElement.query(By.css('#summary-label'));

  //     expect(true).toBeTruthy();
  //     // expect(idLabel.nativeElement.textContent).toContain('ID');
  //     // expect(statusLabel.nativeElement.textContent).toContain('STATUS');
  //     // expect(projectLabel.nativeElement.textContent).toContain('PROJECT');
  //     // expect(typeLabel.nativeElement.textContent).toContain('CARD_TYPE');
  //     // expect(titleLabel.nativeElement.textContent).toContain('TITLE');
  //     // expect(estimationLabel.nativeElement.textContent).toContain('STORY_POINTS');
  //     // expect(assigneeLabel.nativeElement.textContent).toContain('ASSIGNEE');
  //     // expect(priorityLabel.nativeElement.textContent).toContain('PRIORITY');
  //     // expect(tagsLabel.nativeElement.textContent).toContain('TAGS');
  //     // expect(summaryLabel.nativeElement.textContent).toContain('SUMMARY');
  //   });
});
