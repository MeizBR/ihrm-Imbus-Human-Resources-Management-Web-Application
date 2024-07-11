import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy } from '@angular/core';

import { combineLatest, Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { selectCustomersList } from '../../../core/reducers/customer';
import { getDetailedProjectsList } from '../../../core/reducers/project';
import { projectActions } from '../../../core/reducers/project/project.actions';

import { ConfirmDialogModel, CustomerDetails, Roles, SelectBoxItems } from '../../../shared/models';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { ProjectDetailedPermissions, ProjectForUpdate } from '../../../shared/models/project-models/project-models-index';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnDestroy {
  private subscriptions$: Subscription[] = [];

  public projectFromUrl: number;
  public projectDetails: ProjectDetailedPermissions;
  public isAdministrator$: Observable<boolean>;
  public customersList$: Observable<CustomerDetails[] | undefined>;
  public usersToSelect: SelectBoxItems[] = [];

  constructor(public dialog: MatDialog, private store: Store<AppState>, private route: ActivatedRoute) {
    this.subscriptions$.push(this.route.params.subscribe(projectId => (this.projectFromUrl = parseInt(projectId.projectId, 10))));
    this.subscriptions$.push(
      combineLatest([this.route.params, this.store.pipe(select(getDetailedProjectsList))]).subscribe(([projectFromUrl, projects]) => {
        this.projectDetails = projects?.find(project => project.id === parseInt(projectFromUrl.projectId, 10));
      }),
    );

    this.customersList$ = this.store.pipe(select(selectCustomersList));
  }

  ngOnDestroy(): void {
    this.subscriptions$.map(subscription => subscription.unsubscribe);
  }

  public updateProject(projectForUpdate: { project: ProjectForUpdate; projectId: number }): void {
    this.store.dispatch(projectActions.updateProjectAction({ project: projectForUpdate.project }));
  }

  public emittedUsersToSelect(event: SelectBoxItems[]): void {
    this.usersToSelect = event;
  }

  public onAddUserRole(userRoleToAdd: Roles): void {
    this.store.dispatch(projectActions.UpdateProjectRolesAction({ projectId: this.projectDetails?.id, userRole: userRoleToAdd, deletion: false }));
  }

  public deleteProject(id: number): void {
    const data: ConfirmDialogModel = { title: 'DELETE_TITLE', message: 'DELETE_MESSAGE' };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '600px', data });
    const subscribeDialog = dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.store.dispatch(projectActions.deleteProjectAction({ id }));
      }
    });
    dialogRef.afterClosed().subscribe(_ => subscribeDialog.unsubscribe());
  }
}
