import { Component } from '@angular/core';

@Component({
  selector: 'app-reports-summary',
  templateUrl: './reports-summary.component.html',
  styleUrls: ['./reports-summary.component.scss']
})
export class ReportsSummaryComponent {

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
  
  constructor() {  }

}
