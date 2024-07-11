import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs';

import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';

import { cold, hot } from 'jasmine-marbles';

import { reducers } from '../..';
import { selectUserSession } from '../../auth';
import { mappedUsersList } from '../../user/index';
import { projectActions } from '../project.actions';
import { ProjectsEffects } from '../project.effects';

import { ProjectsService } from '../../../services/projects/projects.service';
import { NotificationService } from '../../../services/notification.service';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { ProjectDetails } from '../../../../shared/models/project-models/project-models-index';
import { BackendJsonError, ErrorType } from '../../../../shared/validators/validation-error-type';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';
import { ProjectsListComponent } from '../../../../modules/projects-management/projects-list/projects-list.component';

describe('Project Effects', () => {
  // tslint:disable:no-any
  let actions: Observable<any>;
  let effects: ProjectsEffects;
  let projectsService: jasmine.SpyObj<ProjectsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        AngularMaterialModule,
        RouterTestingModule.withRoutes([{ path: 'home/projects', component: ProjectsListComponent }]),
      ],
      providers: [
        ProjectsEffects,
        provideMockActions(() => actions),
        provideMockStore({
          initialState: {
            authReducer: { userSession: null },
            usersReducer: { usersList: [] },
          },
          selectors: [
            {
              selector: selectUserSession,
              value: {
                workspaceId: 1,
                userId: 1,
                token: 'ABC',
                globalRoles: ['Administrator'],
              },
            },
            {
              selector: mappedUsersList,
              value: [
                {
                  id: 1,
                  firstName: 'Hejer',
                  lastName: 'Ayedi',
                  login: 'ayedi.hejer',
                  email: 'ayedi.hejer@gmail.com',
                  note: '',
                  isActive: true,
                  fullName: 'Hejer Ayedi',
                  globalRoles: [RoleModel.Administrator],
                },
              ],
            },
          ],
        }),
        { provide: NotificationService, useValue: { success: () => {}, warn: () => {} } },
        {
          provide: ProjectsService,
          useValue: jasmine.createSpyObj('projectsService', [
            'getProjects',
            'postProjects',
            'patchProjects',
            'deleteProjects',
            'putProjects',
            'getUserRoleByProject',
            'getOwnProjectRoles',
            'getConnectedUserProjects',
            'getUserProjects',
          ]),
        },
      ],
    });
    effects = TestBed.inject(ProjectsEffects);
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
  });

  describe('load projects list', () => {
    it('should return a stream with loadProjectSuccessAction action', () => {
      const projectsList: ProjectDetails[] = [
        {
          id: 1,
          customerId: 1,
          customer: 'Customer N°1',
          name: 'Project A1',
          description: 'Description of Project A1',
          isActive: true,
          userRoles: [],
        },
      ];
      const action = projectActions.loadProjectAction();
      const outcome = projectActions.loadProjectSuccessAction({ projectsList });
      actions = hot('-a', { a: action });
      projectsService.getProjects.and.returnValue(cold('-a', { a: projectsList }));

      expect(effects.loadProjects$).toBeObservable(cold('--b', { b: outcome }));
    });

    it('should return a stream with loadOwnProjectsSuccessAction action', () => {
      const projectsList: ProjectDetails[] = [
        {
          id: 1,
          customerId: 1,
          customer: 'Customer N°1',
          name: 'Project A1',
          description: 'Description of Project A1',
          isActive: true,
          userRoles: [],
        },
      ];
      const action = projectActions.loadOwnProjectsAction();
      const outcome = projectActions.loadOwnProjectsSuccessAction({
        userId: 1,
        ownProjectsList: projectsList,
      });
      actions = hot('-a', { a: action });
      projectsService.getUserProjects.and.returnValue(cold('-a', { a: projectsList }));

      expect(effects.loadOwnProjects$).toBeObservable(cold('--b', { b: outcome }));
    });

    it('should return a stream with loadUserProjectsSuccessAction action', () => {
      const projectsList: ProjectDetails[] = [
        {
          id: 1,
          customerId: 1,
          customer: 'Customer N°1',
          name: 'Project A1',
          description: 'Description of Project A1',
          isActive: true,
          userRoles: [],
        },
      ];
      const action = projectActions.loadUserProjectsAction({ userId: 1 });
      const outcome = projectActions.loadUserProjectsSuccessAction({ userProjectsList: { userId: 1, projects: projectsList } });
      actions = hot('-a', { a: action });
      projectsService.getUserProjects.and.returnValue(cold('-a', { a: projectsList }));

      expect(effects.loadUserProjects$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('add project', () => {
    it('should return a stream with addUserSuccessAction action', () => {
      const action = projectActions.addProjectAction({
        project: {
          customerId: 1,
          name: 'Project A1',
          description: 'Description of Project A1',
          isActive: true,
        },
      });
      const outcome = projectActions.addProjectSuccessAction({
        project: {
          id: 1,
          customerId: 1,
          customer: 'Customer N°1',
          name: 'Project A1',
          description: 'Description of Project A1',
          isActive: true,
          userRoles: [],
        },
      });
      actions = hot('-a', { a: action });
      projectsService.postProjects.and.returnValue(
        cold('-a|', {
          a: {
            id: 1,
            customerId: 1,
            customer: 'Customer N°1',
            name: 'Project A1',
            description: 'Description of Project A1',
            isActive: true,
            userRoles: [],
          },
        }),
      );

      expect(effects.addProject$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('update project', () => {
    it('should return a stream with updateProjectSuccessAction action', () => {
      const action = projectActions.updateProjectAction({
        project: {
          id: 1,
          customerId: 1,
          name: 'Project A1',
          description: 'Description of Project A1',
          note: '',
          isActive: false,
        },
      });
      const outcome = projectActions.updateProjectSuccessAction({
        project: {
          id: 1,
          customerId: 1,
          customer: 'Customer N°1',
          name: 'Project A1',
          description: 'Description of Project A1',
          isActive: false,
          userRoles: [],
        },
      });
      actions = hot('-a', { a: action });
      projectsService.patchProjects.and.returnValue(
        cold('-a|', {
          a: {
            id: 1,
            customerId: 1,
            customer: 'Customer N°1',
            name: 'Project A1',
            description: 'Description of Project A1',
            isActive: false,
            userRoles: [],
          },
        }),
      );

      expect(effects.updateProject$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('delete user', () => {
    it('should return a stream with deleteUserSuccessAction action', () => {
      const action = projectActions.deleteProjectAction({ id: 1 });
      const outcome = projectActions.deleteProjectSuccessAction({ id: 1 });
      actions = hot('-a', { a: action });
      projectsService.deleteProjects.and.returnValue(cold('-a|', { a: '' }));

      expect(effects.deleteProject$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('load projects roles list', () => {
    it('should return a stream with loadOwnRolesInProjectSuccessAction action', () => {
      const action = projectActions.loadOwnRolesInProjectAction({ projectId: 1 });
      const outcome = projectActions.loadOwnRolesInProjectSuccessAction({
        projectId: 1,
        roles: ['Lead'],
      });
      actions = hot('-a', { a: action });
      projectsService.getOwnProjectRoles.and.returnValue(cold('-a', { a: ['Lead'] }));

      expect(effects.loadOwnProjectRolesAction$).toBeObservable(cold('--b', { b: outcome }));
    });

    it('should return a stream with loadProjectRolesSuccessAction action', () => {
      const action = projectActions.loadProjectRolesAction({ projectId: 1 });
      const outcome = projectActions.loadProjectRolesSuccessAction({
        projectRolesList: {
          project: 1,
          data: [
            {
              user: { id: 1, name: 'Hejer Ayedi', isActive: true },
              roles: ['Lead'],
            },
          ],
        },
      });
      actions = hot('-a', { a: action });
      projectsService.getUserRoleByProject.and.returnValue(
        cold('-a', {
          a: [
            {
              userId: 1,
              roles: ['Lead'],
            },
          ],
        }),
      );

      expect(effects.loadProjectRoles$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('update project roles', () => {
    it('should return a stream with UpdateProjectRolesSuccessAction action', () => {
      const action = projectActions.UpdateProjectRolesAction({
        projectId: 1,
        userRole: {
          user: { id: 1, name: 'admin', isActive: true },
          roles: ['Lead'],
        },
        deletion: false,
      });
      const outcome = projectActions.UpdateProjectRolesSuccessAction({
        data: {
          projectId: 1,
          userRole: {
            user: { id: 1, name: 'admin', isActive: true },
            roles: ['Lead'],
          },
          connectedUser: 1,
        },
      });
      actions = hot('-a', { a: action });
      projectsService.putProjects.and.returnValue(cold('-a|', ''));

      expect(effects.updateProjectRoles$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('delete project roles', () => {
    it('should return a stream with DeleteProjectRolesSuccessAction action', () => {
      const action = projectActions.DeleteProjectRolesAction({ projectId: 1, userRole: { user: { id: 1, name: 'admin', isActive: true }, roles: ['Lead'] } });
      const outcome = projectActions.DeleteProjectRolesSuccessAction({ data: { projectId: 1, userRoleId: 1, connectedUser: 1 } });

      actions = hot('-a', { a: action });
      projectsService.putProjects.and.returnValue(cold('-a|', ''));

      expect(effects.deleteProjectRoles$).toBeObservable(cold('--b', { b: outcome }));
    });
  });

  describe('project management failure', () => {
    it('should return a notification', () => {
      let newBackendJsonError: BackendJsonError = {
        errorCode: 0,
        errorType: 0,
      };
      let action = projectActions.projectManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.fromApiValue(newBackendJsonError) });
      actions = hot('-a', { a: action });
      expect(effects.loadProjects$).toBeObservable(cold(''));

      newBackendJsonError = {
        errorCode: 409,
        errorType: 1002,
      };
      action = projectActions.projectManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.fromApiValue(newBackendJsonError) });
      actions = hot('-a', { a: action });
      expect(effects.addProject$).toBeObservable(cold(''));
    });
  });
});
