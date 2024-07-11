import { createSelector } from '@ngrx/store';

import { AppState } from '..';
import * as tasksState from './tasks-management.reducer';

export const selectFeature = (state: AppState) => state[tasksState.tasksReducerKey];
export const selectTasks = createSelector(selectFeature, state => state.tasksList);
export const selectColumns = createSelector(selectFeature, state => state.progressColumns);
