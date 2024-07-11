import { MatMenuTrigger } from '@angular/material/menu';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { NotificationService } from '../../../../core/services/notification.service';

import { TimeFormat } from '../../../../shared/enum/interval.enum';
import { ActivityDetails, ActivityForAdd, ActivityForUpdate, ProjectDetails } from '../../../../shared/models/index';
import { MatDialog } from '@angular/material/dialog';
import { EditActivityComponent } from '../edit-activity/edit-activity.component';

@Component({
  selector: 'app-activity-details',
  styleUrls: ['./activity-details.component.scss'],
  templateUrl: './activity-details.component.html',
})
export class ActivityDetailsComponent {
  public searchKey: string;
  @Input() userId: number;
  @Input() isCurrent: Boolean = false;
  @Input() activity: ActivityDetails;
  @Input() projects: ProjectDetails[];
  @Input() currentSelectedProject: ProjectDetails;
  @Input() currentTime: string | TimeFormat = TimeFormat.EmptyTimeLabel;

  @Output() onSelectProject = new EventEmitter<number>();
  @Output() onStopCurActivity = new EventEmitter<string>();
  @Output() onSelectCurProject = new EventEmitter<number>();
  @Output() onStartActivity = new EventEmitter<ActivityForAdd>();
  @Output() onRestartActivity = new EventEmitter<ActivityForAdd>();
  @Output() onUpdateActivity = new EventEmitter<ActivityForUpdate>();
  @Output() onDeleteActivity = new EventEmitter<number>();

  constructor(private notificationService: NotificationService, private dialog: MatDialog) {}

  public startActivity(description: string, projectId?: number): void {
    projectId ? this.onStartActivity.emit({ description: description, projectId: projectId, userId: this.userId }) : this.notificationService.warn('Please select a project first');
  }

  public updateActivity(description: string, activity: ActivityDetails): void {
    this.onUpdateActivity.emit({ id: activity?.id, description: description });
  }

  public onSelectCurrentProject(id: number): void {
    this.onSelectCurProject.emit(id);
    this.searchKey = id ? '' : this.searchKey;
  }

  public projectSelected(id: number): void {
    this.onSelectProject.emit(id);
    this.searchKey = id ? '' : this.searchKey;
  }

  public handleMenu(trigger: MatMenuTrigger): void {
    if (!!this.projects?.length) {
      trigger.openMenu();
    } else {
      trigger.closeMenu();
      this.notificationService.warn('No projects available !');
    }
  }

  editActivity(id: number | undefined) {
    const dialogRef = this.dialog.open(EditActivityComponent, {
      data: {id},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
