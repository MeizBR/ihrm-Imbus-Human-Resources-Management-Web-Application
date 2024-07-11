import { Action, createReducer, on } from '@ngrx/store';

import { activityActions } from './activity.actions';

import { ActivityDetails } from '../../../shared/models/activity-models/activity-models-index';

export const activityReducerKey = 'activityReducer';

export interface ActivityState {
  currentActivityState: string;
  activitiesList: ActivityDetails[];
  selfActivitiesList: ActivityDetails[];
}

// FIXME: never used need to be deleted. For now we get only activities for the connected user,
// FIXME: when the dashboard will be implemented we will differentiate between the two lists
// FIXME: For now we get only activities fo the connected user, so no need to add selfActivities
export const initialActivityState: ActivityState = {
  currentActivityState: '',
  activitiesList: undefined,
  selfActivitiesList: undefined,
};

const activityReducer = createReducer(
  initialActivityState,
  on(
    activityActions.loadActivitySuccessAction,
    (state, payload): ActivityState => {
      return {
        ...state,
        activitiesList: payload.activitiesList, // .filter(ac => ac.end),
      };
    },
  ),

  on(
    activityActions.loadSelfActivitySuccessAction,
    (state, payload): ActivityState => {
      return {
        ...state,
        selfActivitiesList: payload.selfActivitiesList, // .filter(ac => ac.end),
      };
    },
  ),

  on(
    activityActions.addActivitySuccessAction,
    (state, payload): ActivityState => {
      return {
        ...state,
        currentActivityState: payload.currentState,
        selfActivitiesList: state.selfActivitiesList ? [...state.selfActivitiesList, payload.activity] : [payload.activity],
      };
    },
  ),

  on(
    activityActions.updateActivitySuccessAction,
    (state, payload): ActivityState => {
      return {
        ...state,
        currentActivityState: payload.currentState,
        selfActivitiesList: [...state.selfActivitiesList?.map(activity => (activity.id === payload.activity.id ? payload.activity : activity))],
      };
    },
  ),

  on(
    activityActions.deleteActivitySuccessAction,
    (state, payload): ActivityState => {
      return {
        ...state,
        currentActivityState: payload.current,
        selfActivitiesList: [...state.selfActivitiesList?.filter(activity => activity.id !== payload.id)],
      };
    },
  ),

  on(
    activityActions.ResetActivitiesStateAction,
    (): ActivityState => {
      return { ...initialActivityState };
    },
  ),
);

export function reducer(state: ActivityState | undefined, action: Action): ActivityState {
  return activityReducer(state, action);
}
