import { Component } from '@angular/core';

@Component({
  selector: 'app-card-task-summary',
  templateUrl: './card-task-summary.component.html',
  styleUrls: ['./card-task-summary.component.scss'],
})
export class CardTaskSummaryComponent {
  // Note: we should declare this as a model to use it!!
  // @Input() cardData: {
  //   Id: string;
  //   Title: string;
  //   Status: string;
  //   Project: string;
  //   Type: string[];
  //   Priority: string;
  //   Assignee: string;
  //   StoryPoints: number;
  //   Tags: string;
  //   Summary: string;
  // };

  constructor() {}

  // public getString(assignee: string): string {
  //   if (typeof assignee === 'string') {
  //     return assignee
  //       .match(/\b(\w)/g)
  //       .join('')
  //       .toUpperCase();
  //   }
  // }
}
