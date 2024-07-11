import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivityDetails, CustomerDetails, ProjectDetails, UserDetails } from 'src/app/shared/models';
import { ActivitiesService } from 'src/app/core/services/activities/activities.service';
import { ProjectsService } from 'src/app/core/services/projects/projects.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { DatePipe } from '@angular/common';
import { CustomersService } from 'src/app/core/services/customers/customers.service';
import { DetailedActivity } from '../components/reports-list/reports-list.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reports-weekly',
  templateUrl: './reports-weekly.component.html',
  styleUrls: ['./reports-weekly.component.scss']
})
export class ReportsWeeklyComponent implements OnInit, OnDestroy {

  showDateValidationError() {
    this._snackBar.open('The selected dates must form a week (6 days difference).', 'Close', {
      duration: 5000, // Duration in milliseconds (5 seconds in this case)
      horizontalPosition: 'center', // Position of the alert
      verticalPosition: 'top', // Position of the alert
    });
  }

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
    private datePipe: DatePipe,
    private _snackBar: MatSnackBar
  ) {  }

  sortDates(dateArray: string[]): string[] {
    return dateArray.slice().sort((a, b) => {
      const date1 = new Date(a.split('/').reverse().join('/'));
      const date2 = new Date(b.split('/').reverse().join('/'));
      return date1.getTime() - date2.getTime();
    });
  }

  getDayName(dateString: string): string {
    const parts = dateString.split('/');
  
    if (parts.length !== 3) {
      return 'Invalid Date';
    }

    const date = new Date(+parts[2], +parts[1] - 1, +parts[0]);

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
  
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  weekStartDate = undefined;
  weekEndDate = undefined;

  x: DetailedActivity[] = [];

  activitiesDatesArray: string[] = [];
  weekDatesArray: string[] = [];

  totalDuration: string = '';

  initialState: boolean = false;

  clearAllFields() {
    this.weekStartDate = undefined;
    this.weekEndDate = undefined;
  }

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

            this.x.push(sx);
  
            this.activitiesDatesArray.push(sx.start.split(" ")[0]);
          });
          this.activitiesDatesArray = this.sortDates(this.activitiesDatesArray.filter((date, index, self) => self.indexOf(date) === index))
          console.log(this.activitiesDatesArray);
          this.weekDatesArray = this.activitiesDatesArray;
        },
        (error: any) => {
          console.error('Error fetching activities:', error);
        }
      );
  
      this.projectsSubscription = this.projects$.subscribe(
        (projects: ProjectDetails[]) => {
          this.projects = projects;
  
          projects.forEach((p) => {
            this.x.forEach((xs) => {
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
            this.x.forEach((xs) => {
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
            this.x.forEach((xs) => {
              if(xs.userId === u.id) {
                xs.userName = `${u.firstName} ${u.lastName}`;
              }
            })
          });
        },
        (error: any) => {
          console.error('Error fetching projects:', error);
        }
      );
      
    } else {
      console.log("Loading data!");
    }
    
  }

  activitiesNumber = 0;

  displayDates() {
    console.log("week start date: ", this.datePipe.transform(this.weekStartDate, 'dd/MM/yyyy') || '');
    console.log("week end date: ", this.datePipe.transform(this.weekEndDate, 'dd/MM/yyyy') || '');

    // this.weekDatesArray = this.activitiesDatesArray.slice(this.weekDatesArray.indexOf(this.weekStartDate), this.weekDatesArray.indexOf(this.weekEndDate));

    // Convert weekStartDate and weekEndDate to Date objects
    const startDate = new Date(this.weekStartDate);
    const endDate = new Date(this.weekEndDate);

    // Initialize an array to hold all the dates between start and end dates
    const allDates: string[] = [];

    // Loop through each date between start and end dates and add it to allDates array
    for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        allDates.push(this.datePipe.transform(currentDate, 'dd/MM/yyyy') || '');
    }

    // Update weekDatesArray with allDates array
    this.weekDatesArray = allDates;

    if (this.weekStartDate !== undefined && this.weekEndDate !== undefined) {
      // Calculate the difference in milliseconds between the end and start dates
      const differenceInMs = new Date(this.weekEndDate).getTime() - new Date(this.weekStartDate).getTime();
    
      // Calculate the difference in days
      const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);
    
      // Ensure the difference is 6 days, indicating a week
      if (differenceInDays === 6) {
        // Transform dates to the desired format and add them to the array
        const formattedStartDate = this.datePipe.transform(this.weekStartDate, 'dd/MM/yyyy') || '';
        const formattedEndDate = this.datePipe.transform(this.weekEndDate, 'dd/MM/yyyy') || '';
        this.weekDatesArray.push(formattedStartDate, formattedEndDate);
    
        // Remove duplicates and sort the array
        this.weekDatesArray = this.weekDatesArray.filter((date, index, self) => self.indexOf(date) === index);
        this.weekDatesArray.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        this.initialState = true;
        // this.weekDatesArray = this.weekDatesArray.slice(this.weekDatesArray.indexOf(this.weekStartDate), this.weekDatesArray.indexOf(this.weekEndDate));
        this.activitiesNumber = this.weekDatesArray.length;
      } else {
        console.log("The selected dates must form a week (6 days difference).");
        this.showDateValidationError();
      }
    } else {
      console.log("Both start and end dates must be provided.");
    }

    console.log("after add: ", this.weekDatesArray);
  }

  isActivityOnDate(activity: DetailedActivity, date: string): boolean {
    const activityDate = activity.start.split(' ')[0];
    return activityDate === date;
  }

  hasActivitiesOnDate(date: string): boolean {
    return this.x.some(activity => activity.start.split(' ')[0] === date);
  }

  ngOnDestroy(): void {
    this.x = [];

    this.activitiesSubscription.unsubscribe();
    this.projectsSubscription.unsubscribe();
    this.usersSubscription.unsubscribe();
  }

}
