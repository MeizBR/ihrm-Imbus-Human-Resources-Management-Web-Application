import { Action, createReducer, on } from '@ngrx/store';
import { settingsActions } from './settings.actions';

import { ErrorType } from '../../../shared/validators/validation-error-type';

// NOTE: Change location of this enum
export enum IHRMAppModules {
  Users = 'Users',
  Customers = 'Customers',
  Leaves = 'Leaves',
  Projects = 'Projects',
  Calendars = 'Calendars',
  Events = 'Events',
}

// NOTE: Change location of this interface
export interface ModulesPagesSizes {
  module: IHRMAppModules;
  size: number;
}

export const settingsReducerKey = 'settingsReducer';
export interface SettingsState {
  modulesPagesSizes: ModulesPagesSizes[] | undefined;
  error: ErrorType | undefined;
  loadingAction: boolean | undefined;
}

// NOTE: verify that this does not make problem
export const initialSettingsState: SettingsState = {
  modulesPagesSizes: [
    { module: IHRMAppModules.Users, size: 5 },
    { module: IHRMAppModules.Customers, size: 5 },
    { module: IHRMAppModules.Leaves, size: 5 },
    { module: IHRMAppModules.Projects, size: 5 },
    { module: IHRMAppModules.Calendars, size: 5 },
    { module: IHRMAppModules.Events, size: 5 },

  ],
  error: undefined,
  loadingAction: false,
};

const settingsReducer = createReducer(
  initialSettingsState,
  on(
    settingsActions.updateModulePageSizeAction,
    (state, pl): SettingsState => ({
      ...state,
      modulesPagesSizes: state.modulesPagesSizes.map(p => (p.module === pl.pageSize.module ? { ...p, size: pl.pageSize.size } : { ...p })),
    }),
  ),
  on(settingsActions.updateModulesPagesSizeAction, (state, payload): SettingsState => ({ ...state, modulesPagesSizes: payload.pagesSizes })),
  on(settingsActions.ResetSettingsStateAction, (): SettingsState => ({ ...initialSettingsState })),
);
export function reducer(state: SettingsState | undefined, action: Action): SettingsState {
  return settingsReducer(state, action);
}
