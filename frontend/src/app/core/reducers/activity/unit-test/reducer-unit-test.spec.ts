import * as fromReducer from '../activity.reducer';
import { activityActions } from '../activity.actions';

describe('Activity reducer', () => {
  describe('An unknown action', () => {
    it('should return the default state', () => {
      const state = fromReducer.reducer(fromReducer.initialActivityState, { type: undefined });

      expect(state).toBe(fromReducer.initialActivityState);
    });
  });

  describe('Dispatch actions', () => {
    it('should load all activities and update the state in an immutable way', () => {
      const activityList = [
        { id: 1, userId: 1, projectId: 1, description: 'Task-01', start: '2021-06-22', end: '2021-06-22', projectName: 'Project A1', workDuration: '1:00:00' },
        { id: 2, userId: 2, projectId: 2, description: 'Task-02', start: '2021-06-22', end: '2021-06-22', projectName: 'Project B1', workDuration: '2:10:00' },
      ];
      const newState: fromReducer.ActivityState = { currentActivityState: '', activitiesList: activityList, selfActivitiesList: undefined };
      const state = fromReducer.reducer(fromReducer.initialActivityState, activityActions.loadActivitySuccessAction({ activitiesList: activityList }));

      expect(state).toEqual(newState);
    });

    it('should add new activity and update the state in an immutable way', () => {
      const newState: fromReducer.ActivityState = {
        currentActivityState: 'started',
        selfActivitiesList: [
          { id: 1, userId: 1, projectId: 1, description: 'Task-01', start: '2021-06-22', end: '2021-06-22', projectName: 'Project A1', workDuration: '1:00:00' },
        ],
        activitiesList: undefined,
      };
      const state = fromReducer.reducer(
        fromReducer.initialActivityState,
        activityActions.addActivitySuccessAction({
          activity: { id: 1, userId: 1, projectId: 1, description: 'Task-01', start: '2021-06-22', end: '2021-06-22', projectName: 'Project A1', workDuration: '1:00:00' },
          currentState: 'started',
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should update an existing activity and update the state in an immutable way', () => {
      const initialActivityState: fromReducer.ActivityState = {
        currentActivityState: 'started',
        selfActivitiesList: [
          { id: 1, userId: 1, projectId: 1, description: 'Task-01', start: '2021-06-22', end: '2021-06-22', projectName: 'Project A1', workDuration: '1:00:00' },
        ],
        activitiesList: undefined,
      };
      let state = fromReducer.reducer(initialActivityState, { type: undefined });

      expect(state).toEqual(initialActivityState);

      const newState: fromReducer.ActivityState = {
        currentActivityState: '',
        selfActivitiesList: [
          { id: 1, userId: 1, projectId: 1, description: 'Task-01-updated', start: '2021-06-22', end: '2021-06-22', projectName: 'Project A1', workDuration: '1:00:00' },
        ],
        activitiesList: undefined,
      };

      state = fromReducer.reducer(
        initialActivityState,
        activityActions.updateActivitySuccessAction({
          activity: { id: 1, userId: 1, projectId: 1, description: 'Task-01-updated', start: '2021-06-22', end: '2021-06-22', projectName: 'Project A1', workDuration: '1:00:00' },
          currentState: '',
        }),
      );

      expect(state).toEqual(newState);
    });

    it('should delete an existing activity and update the state in an immutable way', () => {
      const initialActivityState: fromReducer.ActivityState = {
        currentActivityState: 'started',
        selfActivitiesList: [
          { id: 1, userId: 1, projectId: 1, description: 'Task-01', start: '2021-06-22', end: '2021-06-22', projectName: 'Project A1', workDuration: '1:00:00' },
        ],
        activitiesList: undefined,
      };
      let state = fromReducer.reducer(initialActivityState, { type: undefined });

      expect(state).toEqual(initialActivityState);

      const newState: fromReducer.ActivityState = { currentActivityState: '', activitiesList: undefined, selfActivitiesList: [] };

      state = fromReducer.reducer(initialActivityState, activityActions.deleteActivitySuccessAction({ id: 1, current: '' }));

      expect(state).toEqual(newState);
    });

    it('should reset the state', () => {
      const initialActivityState: fromReducer.ActivityState = {
        currentActivityState: 'started',
        activitiesList: [{ id: 1, userId: 1, projectId: 1, description: 'Task-01', start: '2021-06-22', end: '2021-06-22', projectName: 'Project A1', workDuration: '1:00:00' }],
        selfActivitiesList: undefined,
      };
      let state = fromReducer.reducer(initialActivityState, { type: undefined });

      const newState: fromReducer.ActivityState = { currentActivityState: '', activitiesList: undefined, selfActivitiesList: undefined };

      state = fromReducer.reducer(initialActivityState, activityActions.ResetActivitiesStateAction());

      expect(state).toEqual(newState);
    });
  });
});
