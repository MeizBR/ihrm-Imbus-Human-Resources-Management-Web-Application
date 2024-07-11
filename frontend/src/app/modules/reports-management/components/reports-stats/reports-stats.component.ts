import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivityDetails, CustomerDetails, ProjectDetails, UserDetails } from 'src/app/shared/models';
import { ActivitiesService } from 'src/app/core/services/activities/activities.service';
import { ProjectsService } from 'src/app/core/services/projects/projects.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { DatePipe } from '@angular/common';
import { CustomersService } from 'src/app/core/services/customers/customers.service';
import { DetailedActivity } from '../reports-list/reports-list.component';
import { ChartComponent } from "ng-apexcharts";

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from "ng-apexcharts";
import { DateAdapter } from '@coachcare/datepicker';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

export interface ProjectData {
  name: string,
  data: number[],
}

let x: DetailedActivity[] = [];
@Component({
  selector: 'app-reports-stats',
  templateUrl: './reports-stats.component.html',
  styleUrls: ['./reports-stats.component.scss']
})
export class ReportsStatsComponent implements OnInit, OnDestroy {

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

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

  donutPieFilterDate:string = undefined;

  constructor(
    private activitiesService: ActivitiesService,
    private projectsService: ProjectsService,
    private teamsService: TeamService,
    private customersService: CustomersService,
    private datePipe: DatePipe
  ) {
    this.chartOptions = {};
  }

  durationStringToSeconds(durationString: string): number {
    const [hoursStr, minutesStr, secondsStr] = durationString.split(':');
  
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);
  
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  
    return totalSeconds;
  }

  sortDates(dateArray: string[]): string[] {
    return dateArray.slice().sort((a, b) => {
      const date1 = new Date(a.split('/').reverse().join('/'));
      const date2 = new Date(b.split('/').reverse().join('/'));
      return date1.getTime() - date2.getTime();
    });
  }

  activitiesTotalDurationByDateAndProject(date: String, project: String): number {
    let totalDuration = 0;
    x.map((ac) => {
      if(ac.start.split(" ")[0] === date && ac.projectName === project) {
        totalDuration += this.durationStringToSeconds(ac.workDuration);
      }
    })
    return totalDuration;
  }

  renderChartForDate(date: string): number[] {
    let projectsDurationArray: number[] = [];
    
    const activitiesForDate = x.filter(ac => ac.start.split(" ")[0] === date);

    this.projectsNames.forEach(project => {
      let totalDuration = 0;
      
      activitiesForDate.forEach(activity => {
        if (project === activity.projectName) {
          totalDuration += this.durationStringToSeconds(activity.workDuration);
        }
      });
      
      projectsDurationArray.push(totalDuration);
    });

    return projectsDurationArray;
  }

  activitiesDatesArray: string[] = [];
  projectsArray: ProjectData[] = [];
  projectsNames: string[] = [];

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
  
            this.activitiesDatesArray.push(sx.start.split(" ")[0]);
          });
          this.activitiesDatesArray = this.sortDates(this.activitiesDatesArray.filter((date, index, self) => self.indexOf(date) === index));
        },
        (error: any) => {
          console.error('Error fetching activities:', error);
        }
      );
  
      this.projectsSubscription = this.projects$.subscribe(
        (projects: ProjectDetails[]) => {
          this.projects = projects;
  
          projects.forEach((p) => {
            this.projectsNames.push(p.name);
            x.forEach((xs) => {
              if(xs.projectId === p.id) {
                xs.projectName = p.name;
                xs.customerId = p.customerId;
              }
            })

            let tmp: number[] = [];

            this.sortDates(this.activitiesDatesArray.filter((date, index, self) => self.indexOf(date) === index)).forEach((date) => {
              tmp.push(this.activitiesTotalDurationByDateAndProject(date, p.name));
            });
      
            this.projectsArray.push({
              name: p.name,
              data: tmp,
            });
          })

          this.chartOptions = {
            series: [100],
            chart: {
              type: "donut"
            },
            labels: ["No Dates Selected Yet!"],
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 100
                  },
                  legend: {
                    position: "bottom"
                  }
                }
              }
            ]
          };
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
        },
        (error: any) => {
          console.error('Error fetching projects:', error);
        }
      );
      
    } else {
      console.log("Loading data!");
    }

  }

  showChart() {
    this.chartOptions = {
      series: this.renderChartForDate(this.donutPieFilterDate),
      chart: {
        type: "donut"
      },
      labels: this.projectsNames,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 100
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  formatSecondsToHHMMSS(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  ngOnDestroy(): void {
    x = [];

    if (this.activitiesSubscription) {
      this.activitiesSubscription.unsubscribe();
    }
    if (this.projectsSubscription) {
      this.projectsSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

}
