import { ActionTypes, activityActions } from '../activity.actions';

import { ActivityDetails, ActivityForUpdate } from '../../../../shared/models';

describe('Activity actions', () => {
  const activityPayload: ActivityDetails = {
    id: 1,
    userId: 1,
    projectId: 1,
    description: 'Task-01',
    start: '2021-06-22',
    end: '2021-06-22',
    projectName: 'Project A1',
    workDuration: '1:00:00',
  };
  describe('Load activities actions', () => {
    it('should create loadActivityAction action', () => {
      const action = activityActions.loadActivityAction({ userId: 1 });
      expect(action).toEqual({ userId: 1, type: ActionTypes.LOAD_ACTIVITY });
    });

    it('should create loadActivitySuccessAction action', () => {
      const payload: ActivityDetails[] = [activityPayload];
      const action = activityActions.loadActivitySuccessAction({ activitiesList: payload });

      expect(action).toEqual({ activitiesList: payload, type: ActionTypes.LOAD_ACTIVITY_SUCCESS });
    });
  });

  describe('Add activity actions', () => {
    it('should create addActivityAction action', () => {
      const action = activityActions.addActivityAction({ activity: { userId: 1, projectId: 1, description: 'Task-01' }, currentState: 'started' });
      expect(action).toEqual({ activity: { userId: 1, projectId: 1, description: 'Task-01' }, currentState: 'started', type: ActionTypes.ADD_ACTIVITY });
    });

    it('should create addActivitySuccessAction action', () => {
      const payload: ActivityDetails = activityPayload;
      const action = activityActions.addActivitySuccessAction({ activity: payload, currentState: 'started' });

      expect(action).toEqual({ activity: payload, currentState: 'started', type: ActionTypes.ADD_ACTIVITY_SUCCESS });
    });
  });

  describe('Update activity actions', () => {
    it('should create updateActivityAction action to update the description', () => {
      const payload: ActivityForUpdate = { id: 1, projectId: 1, description: 'Task-01-updated', end: '2021-06-22' };
      const action = activityActions.updateActivityAction({ activity: payload, currentState: '' });
      expect(action).toEqual({ activity: { id: 1, projectId: 1, description: 'Task-01-updated', end: '2021-06-22' }, currentState: '', type: ActionTypes.UPDATE_ACTIVITY });
    });

    it('should create updateActivitySuccessAction action to update the description', () => {
      const payload: ActivityDetails = { ...activityPayload, description: 'Task-01-updated' };
      const action = activityActions.updateActivitySuccessAction({ activity: payload, currentState: '' });

      expect(action).toEqual({ activity: payload, currentState: '', type: ActionTypes.UPDATE_ACTIVITY_SUCCESS });
    });

    it('should create updateActivityAction action to restart an activity', () => {
      const payload: ActivityForUpdate = { id: 1, projectId: 1, description: 'Task-01', end: '2021-06-22' };
      const action = activityActions.updateActivityAction({ activity: payload, currentState: 'restarted' });
      expect(action).toEqual({ activity: { id: 1, projectId: 1, description: 'Task-01', end: '2021-06-22' }, currentState: 'restarted', type: ActionTypes.UPDATE_ACTIVITY });
    });

    it('should create updateActivitySuccessAction action to restart an activity', () => {
      const payload: ActivityDetails = activityPayload;
      const action = activityActions.updateActivitySuccessAction({ activity: payload, currentState: 'restarted' });

      expect(action).toEqual({ activity: payload, currentState: 'restarted', type: ActionTypes.UPDATE_ACTIVITY_SUCCESS });
    });

    it('should create updateActivityAction action to stop the started activity', () => {
      const payload: ActivityForUpdate = { id: 1, projectId: 1, description: 'Task-01', end: '2021-06-22' };
      const action = activityActions.updateActivityAction({ activity: payload, currentState: 'stopped' });
      expect(action).toEqual({ activity: { id: 1, projectId: 1, description: 'Task-01', end: '2021-06-22' }, currentState: 'stopped', type: ActionTypes.UPDATE_ACTIVITY });
    });

    it('should create updateActivitySuccessAction action to stop the started activity', () => {
      const payload: ActivityDetails = activityPayload;
      const action = activityActions.updateActivitySuccessAction({ activity: payload, currentState: 'stopped' });

      expect(action).toEqual({ activity: payload, currentState: 'stopped', type: ActionTypes.UPDATE_ACTIVITY_SUCCESS });
    });
  });

  describe('Delete activity actions', () => {
    it('should create deleteActivityAction action to stop the started activity', () => {
      const action = activityActions.deleteActivityAction({ id: 1, current: 'stopped' });

      expect(action).toEqual({ id: 1, current: 'stopped', type: ActionTypes.DELETE_ACTIVITY });
    });

    it('should create deleteActivitySuccessAction action', () => {
      const action = activityActions.deleteActivitySuccessAction({ id: 1, current: 'stopped' });

      expect(action).toEqual({ id: 1, current: 'stopped', type: ActionTypes.DELETE_ACTIVITY_SUCCESS });
    });
  });
});
