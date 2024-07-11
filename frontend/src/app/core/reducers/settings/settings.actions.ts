import { createAction, props } from '@ngrx/store';

import { ModulesPagesSizes } from './settings.reducer';

export enum ActionTypes {
  /** Customer management actions types */
  LOAD_MODULE_PAGES_SIZE = '[settingsManagement] Load Module Pages Size',
  SET_MODULE_PAGES_SIZE = '[settingsManagement] Set Module Pages Size',
  UPDATE_MODULE_PAGE_SIZE = '[settingsManagement] Update Module Page Size',
  UPDATE_MODULES_PAGES_SIZE = '[settingsManagement] Update Modules Pages Size',

  /** Reset customers state action types*/
  RESET_SETTINGS_STATE = '[settingsManagement] Reset State',

  /** Customers management fail action types*/
  SETTINGS_MANAGEMENT_FAIL = '[settingsManagement] Settings Management Failed',
}

export const settingsActions = {
  /** Customers management actions */
  loadModulePagesSizeAction: createAction(ActionTypes.LOAD_MODULE_PAGES_SIZE),
  setModulePagesSizeAction: createAction(ActionTypes.SET_MODULE_PAGES_SIZE, props<{ pagesSizes: ModulesPagesSizes[]; setToStorage?: boolean }>()),
  updateModulePageSizeAction: createAction(ActionTypes.UPDATE_MODULE_PAGE_SIZE, props<{ pageSize: ModulesPagesSizes }>()),
  updateModulesPagesSizeAction: createAction(ActionTypes.UPDATE_MODULES_PAGES_SIZE, props<{ pagesSizes: ModulesPagesSizes[] }>()),

  /** Reset customers state actions*/
  ResetSettingsStateAction: createAction(ActionTypes.RESET_SETTINGS_STATE),

  /** Reset customers state actions*/
  customerManagementFailAction: createAction(ActionTypes.SETTINGS_MANAGEMENT_FAIL, props<{ withSnackBarNotification: boolean }>()),
};
