import { createSelector } from '@ngrx/store';

import { AppState } from '../index';
import { IHRMAppModules, settingsReducerKey } from './settings.reducer';

export const selectFeature = (state: AppState) => state[settingsReducerKey];
export const getModulesPagesSizes = createSelector(selectFeature, state => state.modulesPagesSizes);
export const getModulePageSize = (m: IHRMAppModules) => createSelector(getModulesPagesSizes, s => s.find(p => p.module === m));
