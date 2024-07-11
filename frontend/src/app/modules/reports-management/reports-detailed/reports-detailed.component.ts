import { Component, OnInit  } from '@angular/core';

@Component({
  selector: 'app-reports-detailed',
  templateUrl: './reports-detailed.component.html',
  styleUrls: ['./reports-detailed.component.scss']
})
export class ReportsDetailedComponent implements OnInit {

  receivedSelectedProject: string;
  receivedSelectedCustomer: string;
  receivedSelectedUser: string;
  receivedSelectedStartDate: Date;
  receivedSelectedEndDate: Date;
  receivedSelectedDescription: string;

  receivedActivitiesNumber: number

  receiveActivitiesNumber(value) {
    this.receivedActivitiesNumber = value;
  }

  receiveProject(value) {
    this.receivedSelectedProject = value;
  }

  receiveCustomer(value) {
    this.receivedSelectedCustomer = value;
  }

  receiveUser(value) {
    this.receivedSelectedUser = value;
  }

  receiveStartDate(value) {
    this.receivedSelectedStartDate= value;
  }

  receiveEndDate(value) {
    this.receivedSelectedEndDate = value;
  }

  receiveDescription(value) {
    this.receivedSelectedDescription = value;
  }

  constructor() {}

  ngOnInit(): void {
    
  }

}
