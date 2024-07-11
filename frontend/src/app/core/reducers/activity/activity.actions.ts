import { createAction, props } from '@ngrx/store';

import { ActivityDetails } from '../../../shared/models/activity-models/activity-models-index';
import { ActivityForAdd, ActivityForUpdate } from '../../../shared/models/activity-models/activity-info-data';

export enum ActionTypes {
  /** Load activities action types */
  LOAD_ACTIVITY = '[activityManagement] Load Activity',
  LOAD_ACTIVITY_SUCCESS = '[activityManagement] Load Activity Success',
  LOAD_ACTIVITY_FAILED = '[activityManagement] Load Activity Failed',

  /** Load self activities action types */
  LOAD_SELF_ACTIVITY = '[activityManagement] Load Self Activity',
  LOAD_SELF_ACTIVITY_SUCCESS = '[activityManagement] Load Self Activity Success',
  LOAD_SELF_ACTIVITY_FAILED = '[activityManagement] Load Self Activity Failed',

  /** Add activities action types */
  ADD_ACTIVITY = '[activityManagement] Add Activity',
  ADD_ACTIVITY_SUCCESS = '[activityManagement] Add Activity Success',
  ADD_ACTIVITY_FAILED = '[activityManagement] Add Activity Failed',

  /** Update activities action types */
  UPDATE_ACTIVITY = '[activityManagement] Update Activity',
  UPDATE_ACTIVITY_SUCCESS = '[activityManagement] Update Activity Success',
  UPDATE_ACTIVITY_FAILED = '[activityManagement] Update Activity Failed',

  /** Delete activities action types */
  DELETE_ACTIVITY = '[activityManagement] Activity Deleted',
  DELETE_ACTIVITY_SUCCESS = '[activityManagement] Activity Deleted Successfully',
  DELETE_ACTIVITY_FAILED = '[activityManagement] Activity Deletion Failed',

  /** Reset activities state action types*/
  RESET_ACTIVITIES_STATE = '[activityManagement] Reset State',
}

export const activityActions = {
  /** Load activities actions */
  loadActivityAction: createAction(ActionTypes.LOAD_ACTIVITY, props<{ from?: string , to?: string}>()),
  loadActivitySuccessAction: createAction(ActionTypes.LOAD_ACTIVITY_SUCCESS, props<{ activitiesList: ActivityDetails[] }>()),
  loadActivityFailedAction: createAction(ActionTypes.LOAD_ACTIVITY_FAILED),

  /** Load self activities actions */
  loadSelfActivityAction: createAction(ActionTypes.LOAD_SELF_ACTIVITY, props<{ from?: string , to?: string}>()),
  loadSelfActivitySuccessAction: createAction(ActionTypes.LOAD_SELF_ACTIVITY_SUCCESS, props<{ selfActivitiesList: ActivityDetails[] }>()),
  loadSelfActivityFailedAction: createAction(ActionTypes.LOAD_SELF_ACTIVITY_FAILED),

  /** Add activities actions */
  addActivityAction: createAction(ActionTypes.ADD_ACTIVITY, props<{ activity: ActivityForAdd; currentState?: string }>()),
  addActivitySuccessAction: createAction(ActionTypes.ADD_ACTIVITY_SUCCESS, props<{ activity: ActivityDetails; currentState?: string }>()),
  addActivityFailedAction: createAction(ActionTypes.ADD_ACTIVITY_FAILED),

  /** Update activities actions */
  updateActivityAction: createAction(ActionTypes.UPDATE_ACTIVITY, props<{ activity: ActivityForUpdate; currentState?: string }>()),
  updateActivitySuccessAction: createAction(ActionTypes.UPDATE_ACTIVITY_SUCCESS, props<{ activity: ActivityDetails; currentState?: string }>()),
  updateActivityFailedAction: createAction(ActionTypes.UPDATE_ACTIVITY_FAILED),

  /** Delete activities actions */
  deleteActivityAction: createAction(ActionTypes.DELETE_ACTIVITY, props<{ id: number; current?: string }>()),
  deleteActivitySuccessAction: createAction(ActionTypes.DELETE_ACTIVITY_SUCCESS, props<{ id: number; current?: string }>()),
  deleteActivityFailedAction: createAction(ActionTypes.DELETE_ACTIVITY_FAILED),

  /** Reset activities state actions*/
  ResetActivitiesStateAction: createAction(ActionTypes.RESET_ACTIVITIES_STATE),
};
