import { initialActivityState } from '../activity.reducer';
import { getCurrentActivity, selectActivitiesList, selectCurrentActivityState } from '..';

import { getActivitiesList } from '../index';

import { ActivityDetails, ProjectDetails } from '../../../../shared/models';

describe('Activity state', () => {
  const onGoingActivity: ActivityDetails = { id: 2, userId: 1, projectId: 2, description: 'Task-02', start: '2021-06-22', end: '', projectName: 'Project B1' };
  const finishedActivity: ActivityDetails = {
    id: 1,
    userId: 1,
    projectId: 1,
    description: 'Task-01',
    start: '2021-06-22',
    end: '2021-06-22',
    projectName: 'Project A1',
    workDuration: '1:00:00',
  };
  const projectA: ProjectDetails = { id: 1, customerId: 2, name: 'Project A1', description: '', isActive: true };
  const projectB: ProjectDetails = { id: 2, customerId: 1, name: 'Project B1', description: '', isActive: true };

  it('Should select the current activity state', () => {
    let result = selectCurrentActivityState.projector(initialActivityState);
    expect(result).toEqual('');

    result = selectCurrentActivityState.projector({ ...initialActivityState, currentActivityState: 'started', activitiesList: [] });

    expect(result).toEqual('started');
  });

  it('Should select the activities list', () => {
    let result = selectActivitiesList.projector(initialActivityState);
    expect(result).toEqual(undefined);

    const activitiesList: ActivityDetails[] = [finishedActivity];
    result = selectActivitiesList.projector({ ...initialActivityState, currentActivityState: 'started', activitiesList });
    expect(result).toEqual(activitiesList);
  });

  it('Should get the old activities', () => {
    const activitiesList = [onGoingActivity, finishedActivity];
    const projectsList = [projectA, projectB];

    const result = getActivitiesList.projector(activitiesList, projectsList);
    expect(result).toEqual([{ ...finishedActivity, projectName: 'Project A1' }]);
  });

  it('Should select the current activity', () => {
    const activitiesList = [onGoingActivity, finishedActivity];
    const projectsList = [projectA, projectB];

    const result = getCurrentActivity.projector(activitiesList, projectsList);
    expect(result).toEqual({ ...onGoingActivity, projectName: 'Project B1' });
  });
});
