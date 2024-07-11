import { createSelector } from '@ngrx/store';

import { AppState } from '../index';

import { getDetailedProjectsList, selectOwnProjectsList, selectProjectsList } from '../project';

import * as activitiesReducer from './activity.reducer';
import { selectCustomersList } from '../customer';
import { mappedUsersList, selectUsersList } from '../user';

export const selectFeature = (state: AppState) => state[activitiesReducer.activityReducerKey];
export const selectCurrentActivityState = createSelector(selectFeature, state => state.currentActivityState);
export const selectActivitiesList = createSelector(selectFeature, state => state.activitiesList);
export const selectSelfActivitiesList = createSelector(selectFeature, state => state.selfActivitiesList);

// FIXME: never used need to be deleted. For now we get only activities for the connected user, when the dashboard will be implemented we will differentiate between the two lists
export const getActivitiesList = createSelector(selectActivitiesList, getDetailedProjectsList, mappedUsersList, (activities, projects, users  ) => {
  return activities?.filter(ac => ac.end)?.map(ac => ({
    ...ac,
    projectName: projects?.find(pr => pr.id === ac.projectId)?.name,
    customerName: projects?.find(pr => pr.id === ac.projectId)?.customer ,
    userName: users?.find(user => user.id === ac.userId)?.fullName
  }));
});

// FIXME: For now we get only activities fo the connected user, (so no need to add selfActivities line 19)
export const getSelfActivitiesList = createSelector(selectSelfActivitiesList, selectProjectsList, (selfActivities, projects) => {
  return selfActivities?.filter(ac => ac.end).map(ac => ({ ...ac, projectName: projects?.find(pr => pr.id === ac.projectId)?.name }));
});

export const getDetailedSelfActivitiesList = createSelector(getSelfActivitiesList, selectOwnProjectsList, getDetailedProjectsList, (selfActivities, ownProjectsList, projects) => {

  return selfActivities?.map(ac => ({
    ...ac,
    restartActivityPermission: !!ownProjectsList?.find(project => project.id === ac.projectId),
    customerName: projects?.find(pr => pr.id === ac.projectId)?.customer
  }));
});

export const getCurrentActivity = createSelector(selectSelfActivitiesList, selectOwnProjectsList, selectCustomersList, (activities, projects) => {
  return activities?.map(ac => ({ ...ac, projectName: projects?.find(pr => pr.id === ac.projectId)?.name })).find(ac => !ac.end);
});
