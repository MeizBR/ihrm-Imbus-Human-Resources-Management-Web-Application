import * as fromReducer from '../project.reducer';
import { projectActions } from '../project.actions';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { ProjectDetails } from '../../../../shared/models/project-models/project-models-index';

describe('Project reducer', () => {
  describe('An unknown action', () => {
    it('should return the default state', () => {
      const state = fromReducer.reducer(fromReducer.initialProjectState, { type: undefined });

      expect(state).toBe(fromReducer.initialProjectState);
    });
  });

  describe('Dispatch actions', () => {
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
      {
        id: 2,
        customerId: 2,
        customer: 'Customer N°2',
        name: 'Project A2',
        description: 'Description of Project A2',
        isActive: true,
        userRoles: [],
      },
    ];
    it('should load all projects and update the state in an immutable way', () => {
      const newState: fromReducer.ProjectState = {
        ownProjects: undefined,
        projectsList: projectsList,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(fromReducer.initialProjectState, projectActions.loadProjectSuccessAction({ projectsList }));

      expect(state).toEqual(newState);
    });

    it('should load own projects and update the state in an immutable way', () => {
      const initialProjectState = {
        ownProjects: [],
        projectsList: projectsList,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      const newState: fromReducer.ProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(
        initialProjectState,
        projectActions.loadOwnProjectsSuccessAction({
          userId: 1,
          ownProjectsList: [projectsList[0]],
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should load user projects and update the state in an immutable way', () => {
      const initialProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      const newState: fromReducer.ProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: { userId: 1, projects: [projectsList[0]] },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(initialProjectState, projectActions.loadUserProjectsSuccessAction({ userProjectsList: { userId: 1, projects: [projectsList[0]] } }));

      expect(state).toEqual(newState);
    });

    it('should add new project and update the state in an immutable way', () => {
      const initialProjectState = {
        ownProjects: undefined,
        projectsList: [projectsList[0]],
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.ProjectState = {
        ownProjects: undefined,
        projectsList,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(
        initialProjectState,
        projectActions.addProjectSuccessAction({
          project: projectsList[1],
        }),
      );
      expect(state).toEqual(newState);
    });

    it('should update an existing project and update the state in an immutable way', () => {
      const initialProjectState: fromReducer.ProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      let state = fromReducer.reducer(initialProjectState, { type: undefined });

      expect(state).toEqual(initialProjectState);

      const newState: fromReducer.ProjectState = {
        ownProjects: [projectsList[0]],
        projectsList: [projectsList[0], { ...projectsList[1], description: 'Updated description of Project A2' }],
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      state = fromReducer.reducer(
        initialProjectState,
        projectActions.updateProjectSuccessAction({
          project: { ...projectsList[1], description: 'Updated description of Project A2' },
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should delete an existing project and update the state in an immutable way', () => {
      const initialProjectState: fromReducer.ProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      let state = fromReducer.reducer(initialProjectState, { type: undefined });

      expect(state).toEqual(initialProjectState);

      const newState: fromReducer.ProjectState = {
        ownProjects: [projectsList[0]],
        projectsList: [projectsList[0]],
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      state = fromReducer.reducer(initialProjectState, projectActions.deleteProjectSuccessAction({ id: 2 }));

      expect(state).toEqual(newState);
    });

    it('should reset the state in an immutable way', () => {
      const initialProjectState: fromReducer.ProjectState = {
        ownProjects: undefined,
        projectsList,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      let state = fromReducer.reducer(initialProjectState, { type: undefined });

      expect(state).toEqual(initialProjectState);

      const newState: fromReducer.ProjectState = {
        ownProjects: undefined,
        projectsList: undefined,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      state = fromReducer.reducer(initialProjectState, projectActions.ResetProjectsStateAction());

      expect(state).toEqual(newState);
    });

    it('should return an error and update the state in an immutable way', () => {
      const initialProjectState: fromReducer.ProjectState = {
        ownProjects: undefined,
        projectsList,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.ProjectState = {
        ownProjects: undefined,
        projectsList,
        userProjectsList: undefined,
        projectsRoles: undefined,
        error: ErrorType.NameAlreadyExists,
        loadingAction: false,
      };

      const state = fromReducer.reducer(
        initialProjectState,
        projectActions.projectManagementFailAction({
          withSnackBarNotification: false,
          errorType: ErrorType.NameAlreadyExists,
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should load own project roles and update the state in an immutable way', () => {
      const initialProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.ProjectState = {
        ownProjects: [{ ...projectsList[0], userRoles: ['Lead'] }],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(
        initialProjectState,
        projectActions.loadOwnRolesInProjectSuccessAction({
          projectId: 1,
          roles: ['Lead'],
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should load project roles and update the state in an immutable way', () => {
      const initialProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.ProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: {
          project: 1,
          data: [
            {
              user: { id: 1, name: 'Hejer', isActive: true },
              roles: ['Lead'],
            },
          ],
        },
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(
        initialProjectState,
        projectActions.loadProjectRolesSuccessAction({
          projectRolesList: {
            project: 1,
            data: [
              {
                user: { id: 1, name: 'Hejer', isActive: true },
                roles: ['Lead'],
              },
            ],
          },
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should not load project roles and update the state in an immutable way', () => {
      const initialProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: undefined,
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.ProjectState = {
        ownProjects: [projectsList[0]],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: {
          project: 1,
          data: [],
        },
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(
        initialProjectState,
        projectActions.loadProjectRolesSuccessAction({
          projectRolesList: {
            project: 1,
            data: [],
          },
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should update project roles and update the state in an immutable way', () => {
      const initialProjectState = {
        ownProjects: [{ ...projectsList[0], userRoles: ['Lead'] }],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [{ ...projectsList[0], userRoles: ['Lead'] }],
        },
        projectsRoles: {
          project: 1,
          data: [
            {
              user: { id: 1, name: 'Hejer', isActive: true },
              roles: ['Lead'],
            },
          ],
        },
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.ProjectState = {
        ownProjects: [{ ...projectsList[0], userRoles: ['Lead', 'Supervisor'] }],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [{ ...projectsList[0], userRoles: ['Lead'] }],
        },
        projectsRoles: {
          project: 1,
          data: [
            {
              user: { id: 1, name: 'Hejer', isActive: true },
              roles: ['Lead', 'Supervisor'],
            },
          ],
        },
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(
        initialProjectState,
        projectActions.UpdateProjectRolesSuccessAction({
          data: {
            projectId: 1,
            userRole: {
              user: { id: 1, name: 'Hejer', isActive: true },
              roles: ['Lead', 'Supervisor'],
            },
            connectedUser: 1,
          },
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should delete project roles and update the state in an immutable way', () => {
      const initialProjectState = {
        ownProjects: [{ ...projectsList[0], userRoles: ['Lead'] }],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: {
          project: 1,
          data: [
            {
              user: { id: 1, name: 'Hejer', isActive: true },
              roles: ['Lead'],
            },
          ],
        },
        error: undefined,
        loadingAction: false,
      };

      const newState: fromReducer.ProjectState = {
        ownProjects: [],
        projectsList,
        userProjectsList: {
          userId: 1,
          projects: [projectsList[0]],
        },
        projectsRoles: {
          project: 1,
          data: [],
        },
        error: undefined,
        loadingAction: false,
      };
      const state = fromReducer.reducer(
        initialProjectState,
        projectActions.DeleteProjectRolesSuccessAction({
          data: {
            projectId: 1,
            userRoleId: 1,
            connectedUser: 1,
          },
        }),
      );

      expect(state).toEqual(newState);
    });
  });
});
