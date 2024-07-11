import { Action, createReducer, on } from '@ngrx/store';

import { projectActions } from './project.actions';

import { ErrorType } from '../../../shared/validators/validation-error-type';
import { ProjectDetails, Roles, RolesDetails, UserProjects } from '../../../shared/models/index';

export const projectReducerKey = 'projectReducer';

export interface ProjectState {
  ownProjects: ProjectDetails[];
  projectsList: ProjectDetails[];
  userProjectsList: UserProjects | undefined; // FIXME: Need to be discussed, the admin can edit a calender project Or Not
  projectsRoles: RolesDetails | undefined;
  error: ErrorType | undefined;
  loadingAction: boolean | undefined;
}

export const initialProjectState: ProjectState = {
  ownProjects: undefined,
  projectsList: undefined,
  userProjectsList: undefined,
  projectsRoles: undefined,
  error: undefined,
  loadingAction: false,
};

const projectReducer = createReducer(
  initialProjectState,
  on(
    projectActions.loadProjectAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),
  on(
    projectActions.loadProjectSuccessAction,
    (state, payload): ProjectState => {
      return { ...state, error: undefined, loadingAction: false, projectsList: payload.projectsList };
    },
  ),

  on(
    projectActions.loadOwnProjectsAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.loadOwnProjectsSuccessAction,
    (state, payload): ProjectState => {
      return { ...state, error: undefined, loadingAction: false, ownProjects: payload.ownProjectsList };
    },
  ),

  on(
    projectActions.loadUserProjectsAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.loadUserProjectsSuccessAction,
    (state, payload): ProjectState => {
      return { ...state, error: undefined, loadingAction: false, userProjectsList: payload.userProjectsList };
    },
  ),

  on(
    projectActions.loadOwnRolesInProjectAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.loadOwnRolesInProjectSuccessAction,
    (state, payload): ProjectState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        ownProjects: state.ownProjects?.map(item =>
          item.id === payload.projectId
            ? {
                ...item,
                userRoles: payload.roles,
              }
            : item,
        ),
      };
    },
  ),

  on(
    projectActions.addProjectAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.addProjectSuccessAction,
    (state, payload): ProjectState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        projectsList: state.projectsList ? [...state.projectsList, payload.project] : [payload.project],
      };
    },
  ),

  on(
    projectActions.updateProjectAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.updateProjectSuccessAction,
    (state, payload): ProjectState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        projectsList: [...state.projectsList.map(project => (project.id === payload.project.id ? payload.project : project))],
        ownProjects: [...state.ownProjects.map(project => (project.id === payload.project.id ? { ...payload.project, userRoles: project.userRoles } : project))],
      };
    },
  ),

  on(
    projectActions.deleteProjectAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.deleteProjectSuccessAction,
    (state, payload): ProjectState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        projectsList: [...state.projectsList.filter(project => project.id !== payload.id)],
        ownProjects: [...state.ownProjects.filter(project => project.id !== payload.id)],
      };
    },
  ),

  on(
    projectActions.loadProjectRolesAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.loadProjectRolesSuccessAction,
    (state, payload): ProjectState => {
      return { ...state, error: undefined, loadingAction: false, projectsRoles: payload.projectRolesList };
    },
  ),

  on(
    projectActions.loadProjectRolesFailedAction,
    (state, payload): ProjectState => {
      return {
        ...state,
        error: undefined, // NOTE: to be discussed
        loadingAction: false,
        projectsRoles: {
          project: payload.projectId,
          data: [],
        },
      };
    },
  ),

  on(
    projectActions.UpdateProjectRolesAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.UpdateProjectRolesSuccessAction,
    (state, payload): ProjectState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        projectsRoles: {
          ...state.projectsRoles,
          data: state.projectsRoles.data.find((roles: Roles) => roles.user.id === payload.data.userRole.user.id)
            ? state.projectsRoles.data.map((mappedRoles: Roles) => (mappedRoles.user.id === payload.data.userRole.user.id ? payload.data.userRole : mappedRoles))
            : [...state.projectsRoles.data, payload.data.userRole],
        },
        ownProjects:
          payload.data.userRole.user.id === payload.data.connectedUser
            ? state.ownProjects?.map(p => (p && p.id === payload.data.projectId ? { ...p, userRoles: payload.data.userRole.roles } : p))
            : state.ownProjects,
      };
    },
  ),

  on(
    projectActions.ResetProjectsStateAction,
    (): ProjectState => {
      return { ...initialProjectState };
    },
  ),

  on(
    projectActions.DeleteProjectRolesAction,
    (state): ProjectState => {
      return { ...state, error: undefined, loadingAction: true };
    },
  ),

  on(
    projectActions.DeleteProjectRolesSuccessAction,
    (state, payload): ProjectState => {
      return {
        ...state,
        error: undefined,
        loadingAction: false,
        projectsRoles: {
          ...state.projectsRoles,
          data: state.projectsRoles.data.filter((roles: Roles) => roles.user.id !== payload.data.userRoleId),
        },
        ownProjects: payload.data.userRoleId === payload.data.connectedUser ? state.ownProjects.filter(p => p && p.id !== payload.data.projectId) : state.ownProjects,
      };
    },
  ),
  on(
    projectActions.projectManagementFailAction,
    (state, payload): ProjectState => {
      return { ...state, error: payload.errorType, loadingAction: false };
    },
  ),
);

export function reducer(state: ProjectState | undefined, action: Action): ProjectState {
  return projectReducer(state, action);
}
