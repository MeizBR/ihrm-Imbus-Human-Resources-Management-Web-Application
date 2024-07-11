import { ActionTypes, projectActions } from '../../../reducers/project/project.actions';

import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { ProjectDetails, ProjectForAdd, ProjectForUpdate, RolesDetails } from '../../../../shared/models/project-models/project-models-index';

describe('Project actions', () => {
  /** Projects actions */
  describe('Load projects actions', () => {
    it('should create loadProjectAction action', () => {
      const action = projectActions.loadProjectAction();
      expect(action).toEqual({ type: ActionTypes.LOAD_PROJECT });
    });

    it('should create loadProjectSuccessAction action', () => {
      const payload: ProjectDetails[] = [
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
      const action = projectActions.loadProjectSuccessAction({ projectsList: payload });

      expect(action).toEqual({ projectsList: payload, type: ActionTypes.LOAD_PROJECT_SUCCESS });
    });
  });

  describe('Load own projects actions', () => {
    it('should create loadOwnProjectsAction action', () => {
      const action = projectActions.loadOwnProjectsAction();
      expect(action).toEqual({ type: ActionTypes.LOAD_OWN_PROJECT });
    });

    it('should create loadOwnProjectsSuccessAction action', () => {
      const payload: ProjectDetails[] = [
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
      const action = projectActions.loadOwnProjectsSuccessAction({ userId: 1, ownProjectsList: payload });

      expect(action).toEqual({ userId: 1, ownProjectsList: payload, type: ActionTypes.LOAD_OWN_PROJECT_SUCCESS });
    });
  });

  describe('Load user projects actions', () => {
    it('should create loadUserProjectsAction action', () => {
      const action = projectActions.loadUserProjectsAction({ userId: 1 });
      expect(action).toEqual({ userId: 1, type: ActionTypes.LOAD_USER_PROJECTS });
    });

    it('should create loadUserProjectsSuccessAction action', () => {
      const payload: ProjectDetails[] = [
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
      const action = projectActions.loadUserProjectsSuccessAction({ userProjectsList: { userId: 1, projects: payload } });

      expect(action).toEqual({ userProjectsList: { userId: 1, projects: payload }, type: ActionTypes.LOAD_USER_PROJECTS_SUCCESS });
    });
  });

  describe('Add project actions', () => {
    it('should create addProjectAction action', () => {
      const payload: ProjectForAdd = {
        customerId: 1,
        name: 'Project A1',
        description: 'Description of Project A1',
        isActive: true,
      };
      const action = projectActions.addProjectAction({ project: payload });
      expect(action).toEqual({ project: payload, type: ActionTypes.ADD_PROJECT });
    });

    it('should create addProjectSuccessAction action', () => {
      const payload: ProjectDetails = {
        id: 1,
        customerId: 1,
        customer: 'Customer N°1',
        name: 'Project A1',
        description: 'Description of Project A1',
        isActive: true,
        userRoles: [],
      };

      const action = projectActions.addProjectSuccessAction({ project: payload });

      expect(action).toEqual({ project: payload, type: ActionTypes.ADD_PROJECT_SUCCESS });
    });
  });

  describe('Update project actions', () => {
    it('should create updateProjectAction action', () => {
      const project: ProjectForUpdate = {
        id: 1,
        customerId: 1,
        name: 'Project A1',
        description: 'Updated description of Project A1',
        note: '',
        isActive: false,
      };
      const action = projectActions.updateProjectAction({ project });

      expect(action).toEqual({
        project,
        type: ActionTypes.UPDATE_PROJECT,
      });
    });

    it('should create updateProjectSuccessAction action', () => {
      const project: ProjectDetails = {
        id: 1,
        customerId: 1,
        customer: 'Customer N°1',
        name: 'Project A1',
        description: 'Updated description of Project A1',
        isActive: false,
        userRoles: [],
      };
      const action = projectActions.updateProjectSuccessAction({ project });

      expect(action).toEqual({ project, type: ActionTypes.UPDATE_PROJECT_SUCCESS });
    });
  });

  describe('Delete project actions', () => {
    it('should create deleteProjectAction action', () => {
      const action = projectActions.deleteProjectAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_PROJECT });
    });

    it('should create deleteProjectSuccessAction action', () => {
      const action = projectActions.deleteProjectSuccessAction({ id: 1 });

      expect(action).toEqual({ id: 1, type: ActionTypes.DELETE_PROJECT_SUCCESS });
    });
  });

  describe('Project management actions', () => {
    it('should create projectManagementFailAction action', () => {
      const action = projectActions.projectManagementFailAction({ withSnackBarNotification: false, errorType: ErrorType.NameAlreadyExists });
      expect(action.type).toEqual(ActionTypes.PROJECT_MANAGEMENT_FAIL);
    });
  });

  describe('Reset state actions', () => {
    it('should create ResetProjectsStateAction action', () => {
      const action = projectActions.ResetProjectsStateAction();

      expect(action).toEqual({ type: ActionTypes.RESET_PROJECTS_STATE });
    });
  });

  /** Project roles actions */
  describe('Load project roles actions', () => {
    it('should create loadProjectRolesAction action', () => {
      const action = projectActions.loadProjectRolesAction({ projectId: 1 });
      expect(action).toEqual({ projectId: 1, type: ActionTypes.LOAD_PROJECT_ROLES });
    });

    it('should create loadProjectRolesSuccessAction action', () => {
      const payload: RolesDetails = {
        project: 1,
        data: [
          {
            user: { id: 1, name: 'Hejer', isActive: true },
            roles: ['Lead'],
          },
        ],
      };
      const action = projectActions.loadProjectRolesSuccessAction({ projectRolesList: payload });

      expect(action).toEqual({ projectRolesList: payload, type: ActionTypes.LOAD_PROJECT_ROLES_SUCCESS });
    });
  });

  describe('Load own project roles actions', () => {
    it('should create loadOwnRolesInProjectAction action', () => {
      const action = projectActions.loadOwnRolesInProjectAction({ projectId: 1 });
      expect(action).toEqual({ projectId: 1, type: ActionTypes.LOAD_ALL_USER_PROJECT_ROLES });
    });

    it('should create loadOwnRolesInProjectSuccessAction action', () => {
      const action = projectActions.loadOwnRolesInProjectSuccessAction({
        projectId: 1,
        roles: ['Lead'],
      });

      expect(action).toEqual({ projectId: 1, roles: ['Lead'], type: ActionTypes.LOAD_ALL_USER_PROJECT_ROLES_SUCCESS });
    });
  });

  describe('Update project roles actions', () => {
    it('should create UpdateProjectRolesAction action', () => {
      const action = projectActions.UpdateProjectRolesAction({
        projectId: 1,
        userRole: {
          user: { id: 1, name: 'Hejer', isActive: true },
          roles: ['Lead'],
        },
        deletion: false,
      });

      expect(action).toEqual({
        projectId: 1,
        userRole: {
          user: { id: 1, name: 'Hejer', isActive: true },
          roles: ['Lead'],
        },
        deletion: false,
        type: ActionTypes.UPDATE_PROJECT_ROLES,
      });
    });

    it('should create UpdateProjectRolesSuccessAction action', () => {
      const data = {
        projectId: 1,
        userRole: {
          user: { id: 1, name: 'Hejer', isActive: true },
          roles: ['Lead'],
        },
        connectedUser: 1,
      };
      const action = projectActions.UpdateProjectRolesSuccessAction({ data });

      expect(action).toEqual({ data, type: ActionTypes.UPDATE_PROJECT_ROLES_SUCCESS });
    });
  });

  describe('Delete project roles actions', () => {
    it('should create DeleteProjectRolesAction action', () => {
      const action = projectActions.DeleteProjectRolesAction({
        projectId: 1,
        userRole: {
          user: { id: 1, name: 'Hejer', isActive: true },
          roles: ['Lead'],
        },
      });

      expect(action).toEqual({
        projectId: 1,
        userRole: {
          user: { id: 1, name: 'Hejer', isActive: true },
          roles: ['Lead'],
        },
        type: ActionTypes.DELETE_PROJECT_ROLES,
      });
    });

    it('should create DeleteProjectRolesSuccessAction action', () => {
      const data = {
        projectId: 1,
        userRoleId: 1,
        connectedUser: 1,
      };
      const action = projectActions.DeleteProjectRolesSuccessAction({ data });

      expect(action).toEqual({
        data: {
          projectId: 1,
          userRoleId: 1,
          connectedUser: 1,
        },
        type: ActionTypes.DELETE_PROJECT_ROLES_SUCCESS,
      });
    });
  });
});
