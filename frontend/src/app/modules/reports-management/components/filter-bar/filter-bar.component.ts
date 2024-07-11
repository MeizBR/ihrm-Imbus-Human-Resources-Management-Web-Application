import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerDetails, ProjectDetails, UserDetails } from 'src/app/shared/models';
import { TeamService } from 'src/app/core/services/team/team.service';
import { ProjectsService } from 'src/app/core/services/projects/projects.service';
import { DetailedActivity } from '../reports-list/reports-list.component';
import { DatePipe } from '@angular/common';
import { CustomersService } from 'src/app/core/services/customers/customers.service';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit, OnDestroy {

  // filter by users list
  users$: Observable<UserDetails[]>;
  users: UserDetails[] = [];

  // filter by projects list
  projects$: Observable<ProjectDetails[]>;
  projects: ProjectDetails[] = [];

  // filter by customers list
  customers$: Observable<CustomerDetails[]>
  customers: CustomerDetails[] = [];

  constructor(
    private teamsService: TeamService,
    private projectsService: ProjectsService,
    private customersService: CustomersService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {

    this.users$ = this.teamsService.getUsers();
    this.users$.subscribe(
      data => {
        this.users = data;
      }
    );

    this.projects$ = this.projectsService.getProjects();
    this.projects$.subscribe(
      data => {
        this.projects = data;
      }
    );

    this.customers$ = this.customersService.getCustomers();
    this.customers$.subscribe(
      data => {
        this.customers = data;
      }
    )

  }

  selectedProject: string = undefined;
  selectedUser: string = undefined;
  selectedCustomer: string = undefined;
  selectedStartDate: Date;
  selectedEndDate: Date;
  selectedDescription: string = '';

  @Output() emittedSelectedProject = new EventEmitter<String>();
  @Output() emittedSelectedCustomer = new EventEmitter<String>();
  @Output() emittedSelectedUser = new EventEmitter<String>();
  @Output() emittedSelectedStartDate = new EventEmitter<String>();
  @Output() emittedSelectedEndDate = new EventEmitter<String>();
  @Output() emittedSelectedDescription = new EventEmitter<String>();

  emitSelectedValue() {
    // console.log('Selected Project:', this.selectedProject);
    // console.log('Selected User:', this.selectedUser);
    // console.log('Selected Start Date:', this.selectedStartDate);
    // console.log('Selected End Date:', this.selectedEndDate);
    // console.log('Selected Customer:', this.selectedCustomer);
    // console.log('Selected Description:', this.selectedDescription);

    this.emittedSelectedProject.emit(this.selectedProject);
    this.emittedSelectedUser.emit(this.selectedUser);
    this.emittedSelectedStartDate.emit(this.datePipe.transform(this.selectedStartDate, 'dd/MM/yyyy'));
    this.emittedSelectedEndDate.emit(this.datePipe.transform(this.selectedEndDate, 'dd/MM/yyyy'));
    this.emittedSelectedCustomer.emit(this.selectedCustomer);
    this.emittedSelectedDescription.emit(this.selectedDescription);
  }

  clearAllFields() {
    this.selectedProject = undefined;
    this.selectedUser = undefined;
    this.selectedCustomer = undefined;
    this.selectedStartDate = undefined;
    this.selectedEndDate = undefined;
    this.selectedDescription = undefined;
  }

  @Output() modifyDataSourceEvent = new EventEmitter<void>();

  displayAllActivities() {
    this.modifyDataSourceEvent.emit();
  }

  @Input() activitiesNumber: number;

  ngOnDestroy(): void {
  }

}
