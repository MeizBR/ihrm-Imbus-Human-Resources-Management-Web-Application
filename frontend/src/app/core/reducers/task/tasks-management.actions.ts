import { createAction, props } from '@ngrx/store';

import { CardDetails } from '../../../shared/models/card-details';
import { ColumnDetails } from '../../../shared/models/columnDetails';

export enum ActionTypes {
  /** Tasks management actions types */
  ADD_TASK_TO_COLUMN = '[tasksManagement] Add Task To Column',
  ADD_TASK_TO_COLUMN_SUCCESS = '[tasksManagement] Add Task To Column Success',
  ADD_TASK_TO_COLUMN_FAILED = '[tasksManagement] Add Task To Column Failed',

  UPDATE_TASK = '[tasksManagement] Update Task',
  UPDATE_TASK_SUCCESS = '[tasksManagement] Update Task Success',
  UPDATE_TASK_FAILED = '[tasksManagement] Update Task Failed',

  DELETE_TASK = '[tasksManagement] Delete Task',
  DELETE_TASK_SUCCESS = '[tasksManagement] Delete Task Success',
  DELETE_TASK_FAILED = '[tasksManagement] Delete Task Failed',

  /** Progress column management action types */
  ADD_COLUMN = '[tasksManagement] Add column',
  ADD_COLUMN_SUCCESS = '[tasksManagement] Add column success',
  ADD_COLUMN_FAILED = '[tasksManagement] Add column failed',

  UPDATE_COLUMN = '[tasksManagement] Update column',
  UPDATE_COLUMN_SUCCESS = '[tasksManagement] Update column success',
  UPDATE_COLUMN_FAILED = '[tasksManagement] Update column failed',

  DELETE_COLUMN = '[tasksManagement] Delete column',
}

export const tasksActions = {
  /**  Tasks management actions */
  addTaskAction: createAction(ActionTypes.ADD_TASK_TO_COLUMN, props<{ task: CardDetails }>()),
  addTaskSuccessAction: createAction(ActionTypes.ADD_TASK_TO_COLUMN_SUCCESS, props<{ task: CardDetails }>()),
  addTaskFailedAction: createAction(ActionTypes.ADD_TASK_TO_COLUMN_FAILED),

  updateTaskAction: createAction(ActionTypes.UPDATE_TASK, props<{ task: CardDetails }>()),
  updateTaskSuccessAction: createAction(ActionTypes.UPDATE_TASK_SUCCESS, props<{ task: CardDetails }>()),
  updateTaskFailedAction: createAction(ActionTypes.UPDATE_TASK_FAILED),

  deleteTaskAction: createAction(ActionTypes.DELETE_TASK, props<{ task: CardDetails }>()),
  deleteTaskSuccessAction: createAction(ActionTypes.DELETE_TASK_SUCCESS, props<{ task: CardDetails }>()),
  deleteTaskFailedAction: createAction(ActionTypes.DELETE_TASK_FAILED),

  /** Progress column management actions */
  addProgressColumnAction: createAction(ActionTypes.ADD_COLUMN, props<{ progressColumn: ColumnDetails }>()),
  addProgressColumnSuccessAction: createAction(ActionTypes.ADD_COLUMN_SUCCESS, props<{ progressColumn: ColumnDetails }>()),
  addProgressColumnFailedAction: createAction(ActionTypes.ADD_COLUMN_FAILED),

  updateProgressColumnAction: createAction(ActionTypes.UPDATE_COLUMN, props<{ progressColumn: ColumnDetails }>()),
  updateProgressColumnSuccessAction: createAction(ActionTypes.UPDATE_COLUMN_SUCCESS, props<{ progressColumn: ColumnDetails }>()),
  updateProgressColumnFailedAction: createAction(ActionTypes.UPDATE_COLUMN_FAILED),

  deleteProgressColumnAction: createAction(ActionTypes.DELETE_COLUMN, props<{ index: number }>()),
};
