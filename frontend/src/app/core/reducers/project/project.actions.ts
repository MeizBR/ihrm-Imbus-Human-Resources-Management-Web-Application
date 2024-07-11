import { createAction, props } from '@ngrx/store';

import { Roles } from '../../../shared/models/role';
import { ErrorType } from '../../../shared/validators/validation-error-type';
import { ProjectDetails, RolesDetails, UserProjects } from '../../../shared/models/project-models/project-details';
import { ProjectForAdd, ProjectForUpdate } from '../../../shared/models/project-models/project-info-data';

export enum ActionTypes {
  /** Load projects action types */
  LOAD_PROJECT = '[projectManagement] Load Project',
  LOAD_PROJECT_SUCCESS = '[projectManagement] Load Project Success',

  /** Load projects by connected user action types */
  LOAD_OWN_PROJECT = '[projectManagement] Loaded Own Project',
  LOAD_OWN_PROJECT_SUCCESS = '[projectManagement] Loaded Own Project Success',

  /** Load projects by user action types */
  LOAD_USER_PROJECTS = '[projectManagement] Loaded User Project',
  LOAD_USER_PROJECTS_SUCCESS = '[projectManagement] Loaded User Project Success',

  /** Add projects action types */
  ADD_PROJECT = '[projectManagement] Add Project',
  ADD_PROJECT_SUCCESS = '[projectManagement] Add Project Success',

  /** Update projects action types */
  UPDATE_PROJECT = '[projectManagement] Update Project',
  UPDATE_PROJECT_SUCCESS = '[projectManagement] Update Project Success',

  /** Delete projects action types */
  DELETE_PROJECT = '[projectManagement] Delete Project',
  DELETE_PROJECT_SUCCESS = '[projectManagement] Delete Project Success',

  /** Load user roles by project action types */
  LOAD_PROJECT_ROLES = '[projectManagement] Load ALL Projects Roles',
  LOAD_PROJECT_ROLES_SUCCESS = '[projectManagement] Load ALL Projects Roles Success',
  LOAD_PROJECT_ROLES_FAILED = '[projectManagement] Load ALL Projects Roles Failed',

  /** Load project roles for all users action types */
  LOAD_ALL_USER_PROJECT_ROLES = '[projectManagement] Load The Project Roles Of All Users',
  LOAD_ALL_USER_PROJECT_ROLES_SUCCESS = '[projectManagement] Load The Project Roles Of All Users Success',

  /** Add roles to project users action types */
  UPDATE_PROJECT_ROLES = '[projectManagement] Update Project Roles',
  UPDATE_PROJECT_ROLES_SUCCESS = '[projectManagement] Update Project Roles Success',

  /** delete all projects roles of user action types */
  DELETE_PROJECT_ROLES = '[projectManagement] Delete Project Roles',
  DELETE_PROJECT_ROLES_SUCCESS = '[projectManagement] Delete Project Roles Success',

  /** Reset projects state action types*/
  RESET_PROJECTS_STATE = '[projectManagement] Reset State',

  PROJECT_MANAGEMENT_FAIL = '[userManagement] Project Management Failed',
}

export const projectActions = {
  /** Load projects actions */
  loadProjectAction: createAction(ActionTypes.LOAD_PROJECT),
  loadProjectSuccessAction: createAction(ActionTypes.LOAD_PROJECT_SUCCESS, props<{ projectsList: ProjectDetails[] }>()),

  /** Load projects by user actions */
  loadOwnProjectsAction: createAction(ActionTypes.LOAD_OWN_PROJECT),
  loadOwnProjectsSuccessAction: createAction(ActionTypes.LOAD_OWN_PROJECT_SUCCESS, props<{ userId: number; ownProjectsList: ProjectDetails[] }>()),

  /** Load projects by user actions */
  loadUserProjectsAction: createAction(ActionTypes.LOAD_USER_PROJECTS, props<{ userId: number }>()),
  loadUserProjectsSuccessAction: createAction(ActionTypes.LOAD_USER_PROJECTS_SUCCESS, props<{ userProjectsList: UserProjects }>()),

  /** Add projects actions */
  addProjectAction: createAction(ActionTypes.ADD_PROJECT, props<{ project: ProjectForAdd }>()),
  addProjectSuccessAction: createAction(ActionTypes.ADD_PROJECT_SUCCESS, props<{ project: ProjectDetails }>()),

  /** Update projects actions */
  updateProjectAction: createAction(ActionTypes.UPDATE_PROJECT, props<{ project: ProjectForUpdate }>()),
  updateProjectSuccessAction: createAction(ActionTypes.UPDATE_PROJECT_SUCCESS, props<{ project: ProjectDetails }>()),

  /** Delete projects actions */
  deleteProjectAction: createAction(ActionTypes.DELETE_PROJECT, props<{ id: number }>()),
  deleteProjectSuccessAction: createAction(ActionTypes.DELETE_PROJECT_SUCCESS, props<{ id: number }>()),

  /** Load user roles by project actions*/
  loadProjectRolesAction: createAction(ActionTypes.LOAD_PROJECT_ROLES, props<{ projectId: number | undefined }>()),
  loadProjectRolesSuccessAction: createAction(ActionTypes.LOAD_PROJECT_ROLES_SUCCESS, props<{ projectRolesList: RolesDetails }>()),
  loadProjectRolesFailedAction: createAction(ActionTypes.LOAD_PROJECT_ROLES_FAILED, props<{ projectId: number }>()),

  /** Load project roles for all users */
  loadOwnRolesInProjectAction: createAction(ActionTypes.LOAD_ALL_USER_PROJECT_ROLES, props<{ projectId: number | undefined }>()),
  loadOwnRolesInProjectSuccessAction: createAction(ActionTypes.LOAD_ALL_USER_PROJECT_ROLES_SUCCESS, props<{ projectId: number; roles: string[] }>()),

  /** Update roles to project users actions*/
  UpdateProjectRolesAction: createAction(ActionTypes.UPDATE_PROJECT_ROLES, props<{ projectId: number; userRole: Roles; deletion: boolean }>()),
  UpdateProjectRolesSuccessAction: createAction(ActionTypes.UPDATE_PROJECT_ROLES_SUCCESS, props<{ data: { projectId: number; userRole: Roles; connectedUser: number } }>()),

  /** delete all projects roles of user action types */
  DeleteProjectRolesAction: createAction(ActionTypes.DELETE_PROJECT_ROLES, props<{ projectId: number; userRole: Roles }>()),
  DeleteProjectRolesSuccessAction: createAction(ActionTypes.DELETE_PROJECT_ROLES_SUCCESS, props<{ data: { projectId: number; userRoleId: number; connectedUser: number } }>()),

  /** Reset projects state actions*/
  ResetProjectsStateAction: createAction(ActionTypes.RESET_PROJECTS_STATE),

  projectManagementFailAction: createAction(ActionTypes.PROJECT_MANAGEMENT_FAIL, props<{ withSnackBarNotification: boolean; errorType: ErrorType }>()),
};
