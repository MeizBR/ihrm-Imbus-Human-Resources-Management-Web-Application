import { MatSort } from '@angular/material/sort'; // it's better to have an intern angular module which contains needed elements and use it
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnChanges, ViewChild } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../../core/reducers';
import { IHRMAppModules, ModulesPagesSizes } from '../../../core/reducers/settings/settings.reducer';

import { projectActions } from '../../../core/reducers/project/project.actions';
import { settingsActions } from '../../../core/reducers/settings/settings.actions';

import { selectActiveCustomersList } from '../../../core/reducers/customer/index';
import { getModulePageSize } from '../../../core/reducers/settings/settings.selectors';
import { getDetailedProjectsList, getProjectsError, getProjectsLoading, selectAddProjectPermission } from '../../../core/reducers/project';

import { displayedProjectColumns, projectColumns } from '../project-helpers';

import { CustomerDetails } from '../../../shared/models';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { ConfirmDialogModel } from '../../../shared/models/confirmDialogModel';
import { sortingDataAccessor } from '../../../shared/helpers/sorting-data.helper';
import { ProjectForAdd } from '../../../shared/models/project-models/project-info-data';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { ProjectDetailedPermissions, ProjectDetails } from '../../../shared/models/project-models/project-models-index';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
})
export class ProjectsListComponent implements OnChanges {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private subscription$: Subscription[] = [];

  public columns = projectColumns;
  public ownProjects: ProjectDetails[];
  public displayedColumns = displayedProjectColumns;
  public projectList: MatTableDataSource<ProjectDetailedPermissions> = new MatTableDataSource();

  public isProjectsPage = false;
  public error$: Observable<ErrorType | undefined>;
  public addPermitted$: Observable<boolean | undefined>;
  public projectsPageSize$: Observable<ModulesPagesSizes>;
  public isProjectsLoading$: Observable<boolean | undefined>;
  public customersList$: Observable<CustomerDetails[] | undefined>;

  constructor(private store: Store<AppState>, private dialog: MatDialog, private router: Router) {
    this.customersList$ = this.store.pipe(select(selectActiveCustomersList));
    this.isProjectsLoading$ = this.store.pipe(select(getProjectsLoading));
    this.addPermitted$ = this.store.pipe(select(selectAddProjectPermission));
    this.error$ = this.store.pipe(select(getProjectsError));
    this.projectsPageSize$ = this.store.pipe(select(getModulePageSize(IHRMAppModules.Projects)));

    this.subscription$.push(
      this.store.pipe(select(getDetailedProjectsList)).subscribe((projects: ProjectDetailedPermissions[]) => {
        this.projectList.data = projects;
        this.projectList.sortingDataAccessor = (data: ProjectDetailedPermissions, sortHeaderId: string): string => sortingDataAccessor(data, sortHeaderId);
      }),
    );

    this.router.events.subscribe(nav => {
      if (nav instanceof NavigationEnd) {
        this.isProjectsPage = !this.router.url.includes('projects/details');
      }
    });
  }

  ngOnChanges(): void {
    this.projectList.sort = this.sort;
    this.projectList.paginator = this.paginator;
  }

  public onAddProject(projectToAdd: ProjectForAdd): void {
    this.store.dispatch(projectActions.addProjectAction({ project: projectToAdd }));
  }

  public onDeleteProject(id: number): void {
    const data: ConfirmDialogModel = { title: 'DELETE_TITLE', message: 'DELETE_MESSAGE' };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });
    this.subscription$.push(
      dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
        if (dialogResult) {
          this.store.dispatch(projectActions.deleteProjectAction({ id: id }));
        }
      }),
    );
  }

  public onChangePageSize(event: { pageSize: number }): void {
    this.store.dispatch(settingsActions.updateModulePageSizeAction({ pageSize: { module: IHRMAppModules.Projects, size: event.pageSize } }));
  }
}
