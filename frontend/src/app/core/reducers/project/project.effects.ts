import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { AppState } from '..';
import { selectUserSession } from '../auth';
import { mappedUsersList } from '../user/index';
import { projectActions } from './project.actions';

import { ProjectsService } from '../../services/projects/projects.service';
import { NotificationService } from '../../services/notification.service';

import { ProjectRolesDetails } from '../../../shared/models/projectRolesDetails';
import { BackendJsonError, ErrorType } from '../../../shared/validators/validation-error-type';
import { mapToPatchProject, mapToPostProject, ProjectDetails } from '../../../shared/models/project-models/project-models-index';

@Injectable()
export class ProjectsEffects {
  loadProjects$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.loadProjectAction),
      switchMap(_ =>
        this.projectsService.getProjects().pipe(
          map((projects: ProjectDetails[]) => projectActions.loadProjectSuccessAction({ projectsList: projects })),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(projectActions.projectManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  loadOwnProjects$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.loadOwnProjectsAction),
      withLatestFrom(this.store.pipe(select(selectUserSession))),
      switchMap(([_, userSession]) =>
        this.projectsService.getUserProjects(userSession.userId).pipe(
          map((projects: ProjectDetails[]) => {
            // NOTE: This action is necessary to obtain the role of the connected user and determine his right to edit the project
            projects.forEach(item => this.store.dispatch(projectActions.loadOwnRolesInProjectAction({ projectId: item.id })));

            return projectActions.loadOwnProjectsSuccessAction({ userId: userSession.userId, ownProjectsList: projects });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(projectActions.projectManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  // @NOTE: to find another solution => we may combine this effect with the previous one
  loadUserProjects$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.loadUserProjectsAction),
      switchMap(action =>
        this.projectsService.getUserProjects(action.userId).pipe(
          map((projects: ProjectDetails[]) => {
            return projectActions.loadUserProjectsSuccessAction({ userProjectsList: { userId: action.userId, projects } });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(projectActions.projectManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        ),
      ),
    );
  });

  loadOwnProjectRolesAction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.loadOwnRolesInProjectAction),
      concatMap(action => {
        return this.projectsService.getOwnProjectRoles(action.projectId).pipe(
          map(roles => {
            return projectActions.loadOwnRolesInProjectSuccessAction({ projectId: action.projectId, roles: roles });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(projectActions.projectManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    );
  });

  addProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.addProjectAction),
      concatMap(action =>
        this.projectsService.postProjects(mapToPostProject(action.project)).pipe(
          map((res: ProjectDetails) => {
            this.notificationService.success('Added successfully');

            return projectActions.addProjectSuccessAction({ project: res });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 1002, // TODO: to be defined with the backend team
            };

            return of(
              projectActions.projectManagementFailAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.NameAlreadyExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  updateProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.updateProjectAction),
      switchMap(action =>
        this.projectsService.patchProjects(mapToPatchProject(action.project), action.project.id).pipe(
          map((res: ProjectDetails) => {
            this.notificationService.success('Updated successfully');

            return projectActions.updateProjectSuccessAction({ project: res });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 1002, // TODO: to be defined with the backend team
            };

            return of(
              projectActions.projectManagementFailAction({
                withSnackBarNotification: ErrorType.fromApiValue(newBackendJsonError) !== ErrorType.LoginExists,
                errorType: ErrorType.fromApiValue(newBackendJsonError),
              }),
            );
          }),
        ),
      ),
    );
  });

  deleteProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectActions.deleteProjectAction),
      concatMap(action => {
        return this.projectsService.deleteProjects(action.id).pipe(
          map(_ => {
            this.notificationService.success('Deleted successfully');
            if (this.router.url !== '/home/projects') {
              this.router.navigate(['home', 'projects']);
            }

            return projectActions.deleteProjectSuccessAction({ id: action.id });
          }),
          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };

            return of(projectActions.projectManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    ),
  );

  loadProjectRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.loadProjectRolesAction),
      withLatestFrom(this.store.pipe(select(mappedUsersList))),
      switchMap(([action, users]) => {
        if (!action.projectId) {
          return of(projectActions.loadProjectRolesSuccessAction({ projectRolesList: undefined }));
        }

        return this.projectsService.getUserRoleByProject(action.projectId).pipe(
          map((roles: ProjectRolesDetails[]) => {
            let rolesByProject = { project: action.projectId, data: [] };
            roles.forEach((role: ProjectRolesDetails) => {
              // FIXME: this map here cause a problem in unit tests, this processing needs to be reviewed
              rolesByProject = {
                ...rolesByProject,
                data: [
                  ...rolesByProject.data,
                  {
                    user: users?.map(user => ({ id: user.id, name: user.fullName, isActive: user.isActive })).find(user => user.id === role.userId),
                    roles: role.roles,
                  },
                ],
              };
            });

            return projectActions.loadProjectRolesSuccessAction({ projectRolesList: rolesByProject });
          }),

          catchError((err: HttpErrorResponse) => {
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: 0, // TODO: to be defined with the backend team
            };
            this.store.dispatch(projectActions.loadProjectRolesFailedAction({ projectId: action.projectId }));

            return of(projectActions.projectManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    );
  });

  updateProjectRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.UpdateProjectRolesAction),
      withLatestFrom(this.store.pipe(select(selectUserSession))),
      concatMap(([action, session]) => {
        const deletion = action.deletion;

        return this.projectsService.putProjects(action.userRole.roles, action.projectId, action.userRole.user.id).pipe(
          map(_ => {
            if (deletion) {
              this.notificationService.warn('Lead role cannot be deleted');
            }

            return projectActions.UpdateProjectRolesSuccessAction({ data: { projectId: action.projectId, userRole: action.userRole, connectedUser: session.userId } });
          }),
          catchError((err: HttpErrorResponse) => {
            // code 1006 To be removed after implementing the web socket
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: err.error.failureType.toString().includes('You cannot set project roles to an inactive user.') ? 1006 : 0, // TODO: to be defined with the backend team
            };

            return of(projectActions.projectManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    );
  });

  deleteProjectRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectActions.DeleteProjectRolesAction),
      withLatestFrom(this.store.pipe(select(selectUserSession))),
      concatMap(([action, session]) => {
        return this.projectsService.putProjects([], action.projectId, action.userRole.user.id).pipe(
          map(_ => projectActions.DeleteProjectRolesSuccessAction({ data: { projectId: action.projectId, userRoleId: action.userRole.user.id, connectedUser: session.userId } })),
          catchError((err: HttpErrorResponse) => {
            // code 1006 To be removed after implementing the web socket
            const newBackendJsonError: BackendJsonError = {
              errorCode: err.status,
              errorType: err.error.failureType.toString().includes('You cannot set project roles to an inactive user.') ? 1006 : 0, // TODO: to be defined with the backend team
            };

            return of(projectActions.projectManagementFailAction({ withSnackBarNotification: true, errorType: ErrorType.fromApiValue(newBackendJsonError) }));
          }),
        );
      }),
    );
  });

  projectManagementFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(projectActions.projectManagementFailAction),
        tap(action => {
          if (action.withSnackBarNotification) {
            const msg = ErrorType.getErrorMessage({ [action.errorType]: true }, 'element');
            this.notificationService.warn(msg);
          }
        }),
      ),
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private projectsService: ProjectsService,
    private notificationService: NotificationService,
    private router: Router,
    private store: Store<AppState>,
  ) {}
}
