import { Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivityDetails, CustomerDetails, ProjectDetails, UserDetails } from 'src/app/shared/models';
import { ActivitiesService } from 'src/app/core/services/activities/activities.service';
import { ProjectsService } from 'src/app/core/services/projects/projects.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { DatePipe } from '@angular/common';
import { CustomersService } from 'src/app/core/services/customers/customers.service';
import * as Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PatchActivity } from 'src/app/generated/patchActivity';

export interface DetailedActivity {
  id: number,
  userId: number,
  userName: String,
  projectId: number,
  projectName: String,
  customerId: number,
  customerName: String,
  description: String,
  start: String,
  end: String,
  workDuration: string,
}

let x: DetailedActivity[] = [];

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss'],
})

export class ReportsListComponent implements OnInit, OnChanges, OnDestroy {

  @Input() SProject: string;
  @Input() SUser: string;
  @Input() SStartDate: string;
  @Input() SEndDate: string;
  @Input() SCustomer: string;
  @Input() SDescription: string;

  @Output() activitiesNumber = new EventEmitter<number>();

  activities$: Observable<ActivityDetails[]>;
  private activitiesSubscription: Subscription;
  activities: ActivityDetails[] = [];

  projects$: Observable<ProjectDetails[]>;
  private projectsSubscription: Subscription;
  projects: ProjectDetails[] = [];

  users$: Observable<UserDetails[]>;
  private usersSubscription: Subscription;
  users: UserDetails[] = [];

  customers$: Observable<CustomerDetails[]>;
  private customersSubscription: Subscription;
  customers: CustomerDetails[] = [];

  constructor(
    private activitiesService: ActivitiesService,
    private projectsService: ProjectsService,
    private teamsService: TeamService,
    private customersService: CustomersService,
    private datePipe: DatePipe
  ) {  }

  filteredActivities: DetailedActivity[] = x;
  totalDuration = '';

  ngOnInit(): void {

    this.activities$ = this.activitiesService.getSelfActivities();
    this.projects$ = this.projectsService.getProjects();
    this.customers$ = this.customersService.getCustomers();
    this.users$ = this.teamsService.getUsers();

    if(
      this.activities$ &&
      this.projects$ &&
      this.customers$ &&
      this.users$
    ) {
      this.activitiesSubscription = this.activities$.subscribe(
        (activities: ActivityDetails[]) => {
          this.activities = activities;
  
          activities.forEach((ac) => {
            const sx: DetailedActivity = {
              id: ac.id,
              userId: ac.userId,
              userName: '',
              projectId: ac.projectId,
              projectName: '',
              customerId: 0,
              customerName: '',
              description: ac.description,
              start: this.datePipe.transform(ac.start, 'dd/MM/yyyy HH:mm:ss') || '',
              end: this.datePipe.transform(ac.end, 'dd/MM/yyyy HH:mm:ss') || '',
              workDuration: ac.workDuration
            };
            x.push(sx);
            console.log("activities: ", activities);
          });
        },
        (error: any) => {
          console.error('Error fetching activities:', error);
        }
      );
  
      this.projectsSubscription = this.projects$.subscribe(
        (projects: ProjectDetails[]) => {
          this.projects = projects;
  
          projects.forEach((p) => {
            x.forEach((xs) => {
              if(xs.projectId === p.id) {
                xs.projectName = p.name;
                xs.customerId = p.customerId;
              }
            })
          });
        },
        (error: any) => {
          console.error('Error fetching projects:', error);
        }
      );
  
      this.customersSubscription = this.customers$.subscribe(
        (customers: CustomerDetails[]) => {
          this.customers = customers;
  
          customers.forEach((c) => {
            x.forEach((xs) => {
              if(xs.customerId === c.id) {
                xs.customerName = c.name;
              }
            })
          })
        }
      )
  
      this.usersSubscription = this.users$.subscribe(
        (users: UserDetails[]) => {
          this.users = users;
  
          users.forEach((u) => {
            x.forEach((xs) => {
              if(xs.userId === u.id) {
                xs.userName = `${u.firstName} ${u.lastName}`;
              }
            })
          });
          console.log("x: ", x);
          this.dataSource = x;
          this.activitiesNumber.emit(this.dataSource.length);
          this.totalDuration = this.sumActivityDurations(this.dataSource);
        },
        (error: any) => {
          console.error('Error fetching projects:', error);
        }
      );
      console.log("Fetched data successfully!");
    } else {
      console.log("Loading data!");
    }

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.SProject || changes.SUser || changes.SStartDate || changes.SEndDate || changes.SCustomer || changes.SDescription) {
      this.filteredActivities = x.filter(activity => {

        let includeActivity = true;
  
        if (this.SProject) {
          includeActivity = includeActivity && activity.projectName === this.SProject;
        }
  
        if (this.SUser) {
          includeActivity = includeActivity && activity.userName === this.SUser;
        }
  
        if (this.SStartDate) {
          includeActivity = includeActivity && activity.start.split(" ")[0] == this.SStartDate;
        }
  
        if (this.SEndDate) {
          includeActivity = includeActivity && activity.end.split(" ")[0] == this.SEndDate;
        }

        if (this.SCustomer) {
          includeActivity = includeActivity && activity.customerName == this.SCustomer;
        }

        if (this.SDescription) {
          const searchTerm = this.SDescription.toLowerCase();
          const activityDescription = activity.description.toLowerCase();

          includeActivity = includeActivity && activityDescription.includes(searchTerm);
        }
  
        return includeActivity;

      });

      this.dataSource = this.filteredActivities;
      this.totalDuration = this.sumActivityDurations(this.dataSource);
    }

    this.activitiesNumber.emit(this.dataSource.length);
  }

  displayedColumns: string[] = ['Description', 'CustomerName', 'ProjectName', 'UserName', 'Start', 'End', 'WorkDuration'];

  dataSource = [];

  sumActivityDurations(detailedActivities: DetailedActivity[]): string {
    const activities: string[] = [];
    detailedActivities.map(d => activities.push(d.workDuration));

    const totalSeconds = activities.reduce((total, duration) => {
      const [hours, minutes, seconds] = duration.split(':').map(Number);
      return total + (hours * 3600) + (minutes * 60) + seconds;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;    

    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  displayAllActivities() {
    this.dataSource = x;
    this.totalDuration = this.sumActivityDurations(this.dataSource);
    this.activitiesNumber.emit(this.dataSource.length);
  }

  exportToCSV(): void {
    const csv = Papa.unparse(this.dataSource);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const columns = Object.keys(this.dataSource[0]);
    const rows = this.dataSource.map(item => columns.map(col => item[col]));

    autoTable(doc, {
      head: [columns],
      body: rows,
    });

    doc.save('data.pdf');
  }

  updateStartDate(startValue: string, activityId: number) {
    const parts = startValue.split(/\/|\s|:/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10) - 2;
    const minute = parseInt(parts[4], 10);
    const second = parseInt(parts[5], 10);

    console.log(day, month, year, hour, minute, second);

    const isoDateString = this.datePipe.transform(new Date(year, month, day, hour, minute, second), 'yyyy-MM-ddTHH:mm:ss') + '.989Z';

    console.log("iso: ", isoDateString);
    
    const activityPatch: PatchActivity = { start: isoDateString };
    
    this.activitiesService.patchActivity(activityPatch, activityId).subscribe(
      (updatedActivity: ActivityDetails) => {
        console.log("Activity updated successfully:", updatedActivity);
        const index = x.findIndex(activity => activity.id === activityId);
        if (index !== -1) {
          const updatedStart = this.datePipe.transform(updatedActivity.start, 'dd/MM/yyyy HH:mm:ss') || '';
          x[index].start = updatedStart;
        }
      },
      error => {
        console.error("Error updating activity:", error);
      }
    );
  }

  updateEndDate(endValue: string, activityId: number) {
    const parts = endValue.split(/\/|\s|:/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10) - 2;
    const minute = parseInt(parts[4], 10);
    const second = parseInt(parts[5], 10);

    console.log("end value: ",endValue)

    console.log(day, month, year, hour, minute, second);

    const isoDateString = this.datePipe.transform(new Date(year, month, day, hour, minute, second), 'yyyy-MM-ddTHH:mm:ss') + '.800Z';

    console.log("iso: ", isoDateString);
    
    const activityPatch: PatchActivity = { end: isoDateString };
    
    this.activitiesService.patchActivity(activityPatch, activityId).subscribe(
      (updatedActivity: ActivityDetails) => {
        console.log("Activity updated successfully:", updatedActivity);
        const index = x.findIndex(activity => activity.id === activityId);
        if (index !== -1) {
          const updatedEnd = this.datePipe.transform(updatedActivity.end, 'dd/MM/yyyy HH:mm:ss') || '';
          x[index].end = updatedEnd;
        }
      },
      error => {
        console.error("Error updating activity:", error);
      }
    );
  }

  updateDescription(description: string, activityId: number) {
    const activityPatch: PatchActivity = { description: description };

    this.activitiesService.patchActivity(activityPatch, activityId).subscribe(
      (updatedActivity: ActivityDetails) => {
        console.log("Activity updated successfully:", updatedActivity);
        const index = x.findIndex(activity => activity.id === activityId);
        if (index !== -1) {
          const updatedDescription = updatedActivity.description;
          x[index].end = updatedDescription;
        }
      },
      error => {
        console.error("Error updating activity:", error);
      }
    );
  }

  ngOnDestroy(): void {
    x = [];
    this.dataSource = [];

    this.activitiesSubscription.unsubscribe();
    this.projectsSubscription.unsubscribe();
    this.usersSubscription.unsubscribe();
    this.customersSubscription.unsubscribe();
  }

}