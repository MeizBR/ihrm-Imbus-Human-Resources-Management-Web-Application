import { Action, createReducer, on } from '@ngrx/store';

import { tasksActions } from './tasks-management.actions';

import { CardDetails } from '../../../shared/models/card-details';
import { ColumnDetails } from '../../../shared/models/columnDetails';

export const tasksReducerKey = 'tasksReducer';

export interface TasksState {
  tasksList: CardDetails[];
  progressColumns: ColumnDetails[];
}

export const initialTasksState: TasksState = {
  tasksList: [],
  progressColumns: [],
};

const tasksReducer = createReducer(
  initialTasksState,

  /** Task management reducer */
  on(
    tasksActions.addTaskSuccessAction,
    (state, payload): TasksState => {
      return { ...state, tasksList: [...state.tasksList, payload.task] };
    },
  ),

  on(
    tasksActions.updateTaskSuccessAction,
    (state, payload): TasksState => {
      return {
        ...state,
        tasksList: [...state.tasksList.map(item => (item.Id !== payload.task.Id ? item : payload.task))],
      };
    },
  ),

  on(
    tasksActions.deleteTaskSuccessAction,
    (state, payload): TasksState => {
      return { ...state, tasksList: state.tasksList.filter(item => item.Id !== payload.task.Id) };
    },
  ),

  /** Progress column management reducer */
  on(
    tasksActions.addProgressColumnSuccessAction,
    (state, payload): TasksState => {
      const newProgressColumns: ColumnDetails[] = [];
      state.progressColumns.map(item => {
        newProgressColumns.push(
          item.index >= payload.progressColumn.index
            ? {
                ...item,
                index: item.index + 1,
              }
            : item,
        );
      });
      newProgressColumns.push(payload.progressColumn);

      return {
        ...state,
        progressColumns: newProgressColumns,
      };
    },
  ),

  on(
    tasksActions.deleteProgressColumnAction,
    (state, payload): TasksState => {
      return {
        ...state,
        progressColumns: state.progressColumns
          .filter(column => column.index !== payload.index)
          .map((item: ColumnDetails) => {
            return item.index > payload.index
              ? {
                  ...item,
                  index: item.index - 1,
                }
              : item;
          }),
      };
    },
  ),
);

export function reducer(state: TasksState | undefined, action: Action): TasksState {
  return tasksReducer(state, action);
}
