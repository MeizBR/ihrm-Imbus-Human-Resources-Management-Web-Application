import { unionBy } from 'lodash';

import { createSelector } from '@ngrx/store';

import { AppState } from '../index';
import { selectCustomersList } from '../customer';
import * as projectsReducer from './project.reducer';
import { selectGlobalRoles, selectUserSession } from '../auth';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { ProjectPermissions } from '../../../shared/enum/actions.enum';
import { globalActionPermitted } from '../../../shared/models/element-role';
import { mapProjectToDetailedProjectPermissions, ProjectDetails } from '../../../shared/models/index';

export const selectFeature = (state: AppState) => state[projectsReducer.projectReducerKey];
export const selectProjectsList = createSelector(selectFeature, state => state.projectsList);
export const selectOwnProjectsList = createSelector(selectFeature, state => state.ownProjects);
export const selectUserProjectsList = createSelector(selectFeature, state => state.userProjectsList);

export const getConnectedUserProjects = createSelector(selectProjectsList, selectOwnProjectsList, selectUserSession, (projects, ownProjects, userSession): ProjectDetails[] =>
  userSession?.globalRoles.includes(RoleModel.Administrator) ? projects : ownProjects,
);

export const getActiveProjectsOfConnectedUser = createSelector(getConnectedUserProjects, (projects): ProjectDetails[] => projects?.filter(project => project.isActive));

export const getProjectsForCalenderOwner = (userId: number, defaultProjectId: number) =>
  createSelector(selectUserSession, selectProjectsList, selectOwnProjectsList, selectUserProjectsList, (userSession, allProject, onwProjects, userProjects) => {
    const projectsList = userSession?.userId === userId ? (userSession?.globalRoles.includes(RoleModel.Administrator) ? allProject : onwProjects) : userProjects?.projects;

    return projectsList?.filter(project => (project.isActive && project.id !== defaultProjectId) || project.id === defaultProjectId);
  });

export const selectAllProjectRolesList = createSelector(selectFeature, state => state && state.projectsRoles);
export const selectAddProjectPermission = createSelector(selectGlobalRoles, role => globalActionPermitted(ProjectPermissions.AddProject, role, 'project'));

export const getDetailedProjectsList = createSelector(
  selectProjectsList,
  selectOwnProjectsList,
  selectGlobalRoles,
  selectCustomersList,
  (projects, ownProjects, globalRole, customers) => {
    return unionBy(ownProjects, projects, 'id')
      .map(project => mapProjectToDetailedProjectPermissions(project, globalRole))
      .map(proj => {
        const projectCustomer = customers?.find(customer => customer.id === proj.customerId);

        return {
          ...proj,
          isActive: projectCustomer?.isActive ? proj.isActive : projectCustomer?.isActive,
          customer: projectCustomer?.name,
          isActiveCustomer: projectCustomer?.isActive,
          userPermissions: {
            ...proj.userPermissions,
            canEdit: proj.userPermissions.canEdit && projectCustomer?.isActive,
            canEditRole: proj.userPermissions.canEditRole && projectCustomer?.isActive,
            canDelete: proj.userPermissions.canEditRole && projectCustomer?.isActive,
          },
        };
      });
  },
);
export const getProjectsError = createSelector(selectFeature, state => state.error);
export const getProjectsLoading = createSelector(selectFeature, state => state.loadingAction);
