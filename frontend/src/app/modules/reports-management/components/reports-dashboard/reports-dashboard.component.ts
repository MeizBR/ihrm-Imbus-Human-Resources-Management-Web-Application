import { Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive,
  ApexXAxis,
  ApexLegend,
  ApexFill
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
};
import { Observable, Subscription } from 'rxjs';
import { ActivityDetails, CustomerDetails, ProjectDetails, UserDetails } from 'src/app/shared/models';
import { ActivitiesService } from 'src/app/core/services/activities/activities.service';
import { ProjectsService } from 'src/app/core/services/projects/projects.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { DatePipe } from '@angular/common';
import { CustomersService } from 'src/app/core/services/customers/customers.service';
import { DetailedActivity } from '../reports-list/reports-list.component';

export interface ProjectData {
  name: string,
  data: number[],
}

let x: DetailedActivity[] = [];

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss']
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {

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

  @Input() SProject: string;
  @Input() SUser: string;
  @Input() SStartDate: string;
  @Input() SEndDate: string;
  @Input() SCustomer: string;
  @Input() SDescription: string;

  @Output() activitiesNumber = new EventEmitter<number>();

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor(
    private activitiesService: ActivitiesService,
    private projectsService: ProjectsService,
    private teamsService: TeamService,
    private customersService: CustomersService,
    private datePipe: DatePipe
  ) {
    this.chartOptions = {};
  }

  sumActivityDurations(activities: ProjectData[]): string {
    let totalDuration = 0;

    activities.map(d => {
      totalDuration += d.data.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    });

    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const remainingSeconds = totalDuration % 60;
  
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
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

  filterTheDashboard(
    project: String = undefined,
    customer: String = undefined,
    user: String = undefined,
    startDate: String = undefined,
    endDate: String = undefined,
    description: String = undefined
  ): number {
    let totalDuration = 0;
  
    x.forEach(ac => {
      if (
        (!project || ac.projectName === project) &&
        (!customer || ac.customerName === customer) &&
        (!user || ac.userName === user) &&
        (!startDate || ac.start.split(" ")[0] === startDate) &&
        (!endDate || ac.end.split(" ")[0] === endDate) &&
        (!description || ac.description.toLowerCase().includes(description.toLowerCase()))
      ) {
        totalDuration += this.durationStringToSeconds(ac.workDuration);
      }
    });
  
    return totalDuration;
  }  

  activitiesDatesArray: string[] = [];
  projectsArray: ProjectData[] = [];
  chartData: ProjectData[] = [];
  datesArray: string[] = [];

  totalDuration: string = '';

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

            let tmp: number[] = [];

            this.datesArray = this.sortDates(this.activitiesDatesArray.filter((date, index, self) => self.indexOf(date) === index))

            this.datesArray.forEach((date) => {
              tmp.push(this.activitiesTotalDurationByDateAndProject(date, p.name));
            });
      
            this.projectsArray.push({
              name: p.name,
              data: tmp,
            });

            this.chartData = this.projectsArray;
          });

          this.chartOptions = {
            series: this.chartData,
            chart: {
              type: "bar",
              width: 1500,
              height: 550,
              stacked: true,
              stackType: "100%",
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  legend: {
                    position: "bottom",
                    offsetX: -10,
                    offsetY: 0
                  }
                }
              }
            ],
            xaxis: {
              categories: this.datesArray,
            },
            fill: {
              opacity: 1
            },
            legend: {
              position: "right",
              offsetX: 0,
              offsetY: 50
            },
          }
          this.activitiesNumber.emit(this.chartData[0].data.length);
          this.totalDuration = this.sumActivityDurations(this.chartData);
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

  ngOnChanges(changes: SimpleChanges): void {

    let filteredDate: string[] = [];

    if (changes.SProject || changes.SUser || changes.SStartDate || changes.SEndDate || changes.SCustomer || changes.SDescription) {

      let filteredProjectsArray: ProjectData[] = [];
  
      let tmp: number[] = [];
        
      if(this.SStartDate || this.SEndDate) {

        tmp.push(this.filterTheDashboard(this.SProject, this.SCustomer, this.SUser, this.SStartDate, this.SEndDate, this.SDescription));
        filteredDate.push(this.SStartDate)
        this.chartOptions.xaxis.categories = filteredDate

      } else {

        this.sortDates(this.activitiesDatesArray.filter((date, index, self) => self.indexOf(date) === index)).forEach((date) => {
          tmp.push(this.filterTheDashboard(this.SProject, this.SCustomer, this.SUser, date, date, this.SDescription));
        });
        filteredDate = this.sortDates(this.activitiesDatesArray.filter((date, index, self) => self.indexOf(date) === index));

      }
        
      filteredProjectsArray.push({
        name: this.SProject,
        data: tmp,
      });
  
      console.log(tmp.filter(d => d != 0).length);

      this.chartData = filteredProjectsArray

      this.totalDuration = this.sumActivityDurations(this.chartData);

      this.activitiesNumber.emit(tmp.filter(d => d != 0).length);
    }

    this.chartOptions = {
      ... this.chartOptions,
      series: this.chartData,
      xaxis: {
        categories: filteredDate,
      }
    }
  }

  displayAllActivities() {
    this.chartData = this.projectsArray;

    this.totalDuration = this.sumActivityDurations(this.chartData);

    this.chartOptions = {
      ... this.chartOptions,
      series: this.chartData,
      xaxis: {
        categories: this.datesArray,
      }
    }
    this.activitiesNumber.emit(this.chartData[0].data.length);
  }

  ngOnDestroy(): void {
    x = [];

    this.activitiesSubscription.unsubscribe();
    this.projectsSubscription.unsubscribe();
    this.usersSubscription.unsubscribe();
  }

}
